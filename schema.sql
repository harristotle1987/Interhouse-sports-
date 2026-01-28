-- ==========================================================
-- SOVEREIGN SECURITY HARDENING PROTOCOL [V120.0 - NEXUS OVERRIDE]
-- ==========================================================

-- 1. SECURITY INITIALIZATION
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- 2. GLOBAL BYPASS: SUPER ADMIN AUTHORITY
-- Restores absolute control for users with 'super_admin' metadata.
DROP POLICY IF EXISTS "Super Admin Access" ON public.matches;
CREATE POLICY "Super Admin Access" ON public.matches
FOR ALL TO authenticated
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'super_king') );

DROP POLICY IF EXISTS "Super Admin Profiles Access" ON public.profiles;
CREATE POLICY "Super Admin Profiles Access" ON public.profiles
FOR ALL TO authenticated
USING ( (auth.jwt() -> 'user_metadata' ->> 'role') IN ('super_admin', 'super_king') );

-- 3. SECTOR ENFORCEMENT: SUB-ADMIN LOCKDOWN
-- Restricts UPSS, CAM, and CAGS admins to their assigned school nodes.
DROP POLICY IF EXISTS "Sub-Admin Access" ON public.matches;
CREATE POLICY "Sub-Admin Access" ON public.matches
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'sub_admin' 
  AND school_arm::text = (auth.jwt() -> 'user_metadata' ->> 'school_arm')
);

-- 4. MEMBER ACCESS: REGISTRY VISIBILITY
DROP POLICY IF EXISTS "Global Member Visibility" ON public.profiles;
CREATE POLICY "Global Member Visibility" ON public.profiles
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "Global Match Visibility" ON public.matches;
CREATE POLICY "Global Match Visibility" ON public.matches
FOR SELECT TO authenticated
USING (true);

-- 5. ATOMIC PURGE RPC (SUPER ADMIN ONLY)
CREATE OR REPLACE FUNCTION purge_all_data()
RETURNS void AS $$
BEGIN
    IF (auth.jwt() -> 'user_metadata' ->> 'role') NOT IN ('super_admin', 'super_king') THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: ARCHITECT_CLEARANCE_REQUIRED';
    END IF;

    TRUNCATE public.event_results CASCADE;
    TRUNCATE public.matches CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;