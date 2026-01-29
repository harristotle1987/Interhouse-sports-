-- ==========================================================
-- SOVEREIGN CORE SQL [V135.0 - NEXUS UNIFIED]
-- RLS REPAIR & SECTOR SOVEREIGNTY PROTOCOLS
-- ==========================================================

-- 1. TERMINATE LEGACY PROTOCOLS
DROP POLICY IF EXISTS "Admin Profile Management" ON profiles;
DROP POLICY IF EXISTS "Sovereign Match CRUD" ON matches;
DROP POLICY IF EXISTS "Sector Result Management" ON event_results;
DROP POLICY IF EXISTS "Nexus Identity Control" ON profiles;
DROP POLICY IF EXISTS "Nexus Unified Management" ON matches;

-- 2. IDENTITY CORE: ANTI-RECURSION SHIELD
-- Super Admins: Global Authority | Users: Self-Access
-- Uses direct JWT app_metadata to bypass table-query loops.
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

-- 3. THE NEXUS LEDGER (MATCHES + PROVISIONS + STAGING)
-- Super Admins: Global CRUD | Sub-Admins: Sector-Locked CRUD
-- This unified policy solves the 'New Row Violates RLS' error during Nexus initialization.
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

-- 4. TELEMETRY COMMITS (RESULTS)
-- Sub-Admins can only commit results to matches within their sector node.
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sector Telemetry Commit" ON public.event_results
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (
    EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = match_id 
      AND m.school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm'
    )
  )
);

-- 5. PUBLIC BROADCAST (GUEST ACCESS)
DROP POLICY IF EXISTS "Global Broadcast" ON public.matches;
CREATE POLICY "Global Broadcast" ON public.matches FOR SELECT USING (true);
DROP POLICY IF EXISTS "Global Results" ON public.event_results;
CREATE POLICY "Global Results" ON public.event_results FOR SELECT USING (true);

-- 6. SYSTEM PURGE RPC (SUPER ADMIN ONLY)
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