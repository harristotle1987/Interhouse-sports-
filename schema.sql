-- ==========================================================
-- SOVEREIGN CORE SQL [V131.0 - OBSIDIAN REPAIR]
-- RECURSION BYPASS & SECTOR-LOCKING PROTOCOLS
-- ==========================================================

-- 1. JWT CLAIM HELPERS (ULTRA-FAST)
-- Extracts values directly from JWT to avoid recursive table lookups
CREATE OR REPLACE FUNCTION get_my_claim_text(claim TEXT)
RETURNS TEXT LANGUAGE sql STABLE AS $$
  SELECT current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> claim
$$;

-- 2. PROFILES SECURITY (IDENTITY HUB)
-- Super Admins manage all 2 Super + 9 Sub-admins.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin Identity Management" ON public.profiles;
CREATE POLICY "Admin Identity Management" ON public.profiles
FOR ALL TO authenticated
USING (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (auth.uid() = id)
);

-- 3. MATCHES/NEXUS SECURITY (UNIFIED CONTROL)
-- Sub-Admins are locked to their specific house IDs (school_arm)
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sub-Admin Nexus Control" ON public.matches;
CREATE POLICY "Sub-Admin Nexus Control" ON public.matches
FOR ALL TO authenticated
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

-- 4. PROVISIONS/RESULTS SECURITY
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sector Result Management" ON public.event_results;
CREATE POLICY "Sector Result Management" ON public.event_results
FOR ALL TO authenticated
USING (
  (get_my_claim_text('role') IN ('super_admin', 'super_king')) OR
  (
    get_my_claim_text('role') = 'sub_admin' AND 
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id 
      AND m.school_arm::text = get_my_claim_text('school_arm')
    )
  )
);

-- 5. PUBLIC BROADCAST (READ-ONLY FEED)
DROP POLICY IF EXISTS "Global Broadcast Access" ON public.matches;
CREATE POLICY "Global Broadcast Access" ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Global Result Access" ON public.event_results;
CREATE POLICY "Global Result Access" ON public.event_results FOR SELECT USING (true);

-- 6. SYSTEM KILL-SWITCH (SUPER ADMIN ONLY)
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