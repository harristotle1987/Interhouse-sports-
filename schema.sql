-- ==========================================================
-- SOVEREIGN CORE SQL [V137.0 - OBSIDIAN HARDENED]
-- RLS REPAIR, NEXUS MERGER & COLLISION NEUTRALIZATION
-- ==========================================================

-- 1. PURGE ALL POSSIBLE POLICY COLLISIONS
DROP POLICY IF EXISTS "Nexus Identity Control" ON public.profiles;
DROP POLICY IF EXISTS "Sovereign Profile Authority" ON public.profiles;
DROP POLICY IF EXISTS "Admin Profile Management" ON public.profiles;
DROP POLICY IF EXISTS "Nexus Unified Management" ON public.matches;
DROP POLICY IF EXISTS "Nexus Sector Management" ON public.matches;
DROP POLICY IF EXISTS "Sovereign Match CRUD" ON public.matches;
DROP POLICY IF EXISTS "Sector Telemetry Commit" ON public.event_results;
DROP POLICY IF EXISTS "Sector Result Authority" ON public.event_results;
DROP POLICY IF EXISTS "Public Feed Access" ON public.matches;
DROP POLICY IF EXISTS "Public Result Access" ON public.event_results;
DROP POLICY IF EXISTS "Global Broadcast" ON public.matches;
DROP POLICY IF EXISTS "Global Results" ON public.event_results;

-- 2. IDENTITY CORE: THE ARCHITECT BYPASS
-- Grants 2 Super Admins (super_admin, super_king) global power to provision Sub-Admins.
-- Prevents infinite recursion by reading directly from the JWT app_metadata.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nexus Identity Control" ON public.profiles
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (auth.uid() = id)
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (auth.uid() = id)
);

-- 3. THE NEXUS LEDGER (MERGED STAGE & PROVISIONS)
-- Resolves 'NEW ROW VIOLATES RLS' by validating the school_arm against the JWT claim.
-- Sub-Admins are strictly empowered within their sector (UPSS, CAM, CAGS).
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nexus Unified Management" ON public.matches
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm')
);

-- 4. TELEMETRY RESULTS SECURITY
-- Sub-Admins can commit results ONLY if the parent match belongs to their sector.
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sector Result Authority" ON public.event_results
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND m.school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm'
  )
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  EXISTS (
    SELECT 1 FROM public.matches m 
    WHERE m.id = match_id 
    AND m.school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm'
  )
);

-- 5. PUBLIC GUEST BROADCAST (SELECT ONLY)
DROP POLICY IF EXISTS "Global Broadcast" ON public.matches;
CREATE POLICY "Global Broadcast" ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Global Results" ON public.event_results;
CREATE POLICY "Global Results" ON public.event_results FOR SELECT USING (true);

-- 6. ARCHITECT SYSTEM PURGE (SUPER ADMIN ONLY)
CREATE OR REPLACE FUNCTION purge_all_data()
RETURNS void AS $$
BEGIN
    IF auth.jwt() -> 'app_metadata' ->> 'role' NOT IN ('super_admin', 'super_king') THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: ARCHITECT_CLEARANCE_REQUIRED';
    END IF;

    TRUNCATE public.event_results CASCADE;
    TRUNCATE public.matches CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;