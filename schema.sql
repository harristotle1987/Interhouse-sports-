-- ==========================================================
-- SOVEREIGN SECURITY HARDENING PROTOCOL [V129.0 - PRODUCTION]
-- CLEAN-TEXT JWT HELPERS & RECURSION BYPASS
-- ==========================================================

-- 1. AUTH HELPERS (NON-RECURSIVE)
-- These functions extract claims directly from the JWT for high-speed evaluation.

-- Returns a JSONB object from app_metadata (Secure)
CREATE OR REPLACE FUNCTION get_my_claim(claim TEXT)
RETURNS jsonb
LANGUAGE sql
STABLE
AS $$
  SELECT coalesce(
    current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' -> claim,
    'null'::jsonb
  )
$$;

-- Returns a clean TEXT value (no quotes) from app_metadata (Secure)
CREATE OR REPLACE FUNCTION get_my_claim_text(claim TEXT)
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> claim
$$;


-- 2. SECURITY INITIALIZATION
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;


-- 3. MATCHES: SECTOR-LOCKED TELEMETRY
-- Enforces administrative boundaries based on the operative's assigned Node.

-- Drop existing policies to avoid handshake conflicts.
DROP POLICY IF EXISTS "Allow admins to insert matches" ON public.matches;
DROP POLICY IF EXISTS "Allow admins to view matches" ON public.matches;
DROP POLICY IF EXISTS "Allow admins to update matches" ON public.matches;
DROP POLICY IF EXISTS "Allow SUPER_KING to delete matches" ON public.matches;
DROP POLICY IF EXISTS "Allow global match visibility" ON public.matches;

-- INSERT POLICY:
-- Super Admins have global provisioning authority.
-- Sub-Admins (Sector Officials) are locked to their assigned Node.
CREATE POLICY "Allow admins to insert matches"
ON public.matches
FOR INSERT
TO authenticated
WITH CHECK (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (
    get_my_claim_text('role') = 'sub_admin' AND 
    school_arm::text = get_my_claim_text('school_arm')
  )
);

-- SELECT POLICY:
-- Controls visibility of match telemetry. 
-- Note: Set to true if global visibility is required for public leaderboards.
CREATE POLICY "Allow admins to view matches"
ON public.matches
FOR SELECT
TO authenticated
USING (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (
    get_my_claim_text('role') IN ('sub_admin', 'member') AND 
    school_arm::text = get_my_claim_text('school_arm')
  )
);

-- UPDATE POLICY:
-- Prevents cross-sector data manipulation.
CREATE POLICY "Allow admins to update matches"
ON public.matches
FOR UPDATE
TO authenticated
USING (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (
    get_my_claim_text('role') = 'sub_admin' AND 
    school_arm::text = get_my_claim_text('school_arm')
  )
)
WITH CHECK (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (
    get_my_claim_text('role') = 'sub_admin' AND 
    school_arm::text = get_my_claim_text('school_arm')
  )
);

-- DELETE POLICY:
-- Destructive operations restricted to High Command.
CREATE POLICY "Allow SUPER_KING to delete matches"
ON public.matches
FOR DELETE
TO authenticated
USING (
  get_my_claim_text('role') IN ('super_admin', 'super_king')
);


-- 4. SYSTEM KILL-SWITCH (SUPER ADMIN ONLY)
CREATE OR REPLACE FUNCTION purge_all_data()
RETURNS void AS $$
BEGIN
    IF get_my_claim_text('role') NOT IN ('super_admin', 'super_king') THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: ARCHITECT_CLEARANCE_REQUIRED';
    END IF;

    TRUNCATE public.event_results CASCADE;
    TRUNCATE public.matches CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;