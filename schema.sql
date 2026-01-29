-- ==========================================================
-- SOVEREIGN SECURITY HARDENING PROTOCOL [V124.0 - RECURSION REMOVAL]
-- ==========================================================

-- 1. RESET SECURITY STATE
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- 2. NON-RECURSIVE PROFILE POLICIES
-- Uses app_metadata claims to avoid querying the profiles table within its own policy
DROP POLICY IF EXISTS "Sovereign Profile Access" ON public.profiles;
CREATE POLICY "Sovereign Profile Access" ON public.profiles
FOR ALL TO authenticated
USING (
  (auth.uid() = id) OR 
  ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'super_king'))
);

DROP POLICY IF EXISTS "Global Profile Visibility" ON public.profiles;
CREATE POLICY "Global Profile Visibility" ON public.profiles
FOR SELECT TO authenticated
USING (true);

-- 3. SECURE MATCH POLICIES
-- Enforces sector boundaries and administrative authority via secure JWT claims
DROP POLICY IF EXISTS "Sovereign Match Access" ON public.matches;
CREATE POLICY "Sovereign Match Access" ON public.matches
FOR ALL TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'super_king')) OR
  (
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'sub_admin') AND 
    (school_arm::text = (auth.jwt() -> 'app_metadata' ->> 'school_arm'))
  )
);

DROP POLICY IF EXISTS "Global Match Read" ON public.matches;
CREATE POLICY "Global Match Read" ON public.matches
FOR SELECT TO authenticated
USING (true);

-- 4. SECURE RESULTS POLICIES
DROP POLICY IF EXISTS "Sovereign Results Access" ON public.event_results;
CREATE POLICY "Sovereign Results Access" ON public.event_results
FOR ALL TO authenticated
USING (
  ((auth.jwt() -> 'app_metadata' ->> 'role') IN ('super_admin', 'super_king')) OR
  (
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.matches 
      WHERE matches.id = event_results.match_id 
      AND matches.school_arm::text = (auth.jwt() -> 'app_metadata' ->> 'school_arm')
    )
  )
);

DROP POLICY IF EXISTS "Global Results Read" ON public.event_results;
CREATE POLICY "Global Results Read" ON public.event_results
FOR SELECT TO authenticated
USING (true);

-- 5. ATOMIC SYSTEM PURGE (SUPER ADMIN ONLY)
CREATE OR REPLACE FUNCTION purge_all_data()
RETURNS void AS $$
BEGIN
    IF (auth.jwt() -> 'app_metadata' ->> 'role') NOT IN ('super_admin', 'super_king') THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: ARCHITECT_CLEARANCE_REQUIRED';
    END IF;

    TRUNCATE public.event_results CASCADE;
    TRUNCATE public.matches CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
