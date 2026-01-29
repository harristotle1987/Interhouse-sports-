-- ==========================================================
-- SOVEREIGN CORE SQL [V138.0 - NEXUS UNIFIED]
-- RLS REPAIR, NEXUS MERGER & RECURSION NEUTRALIZATION
-- ==========================================================

-- 1. TERMINATE LEGACY SECURITY BUFFERS
DROP POLICY IF EXISTS "Nexus Identity Control" ON public.profiles;
DROP POLICY IF EXISTS "Sovereign Profile Authority" ON public.profiles;
DROP POLICY IF EXISTS "Admin Profile Management" ON public.profiles;
DROP POLICY IF EXISTS "Nexus Unified Management" ON public.matches;
DROP POLICY IF EXISTS "Nexus Sector Management" ON public.matches;
DROP POLICY IF EXISTS "Nexus Sector Empowerment" ON public.matches;
DROP POLICY IF EXISTS "Sovereign Match CRUD" ON public.matches;
DROP POLICY IF EXISTS "Sector Telemetry Commit" ON public.event_results;
DROP POLICY IF EXISTS "Sector Result Authority" ON public.event_results;
DROP POLICY IF EXISTS "Sector Result Provisioning" ON public.event_results;
DROP POLICY IF EXISTS "Public Feed Access" ON public.matches;
DROP POLICY IF EXISTS "Public Result Access" ON public.event_results;
DROP POLICY IF EXISTS "Global Broadcast" ON public.matches;
DROP POLICY IF EXISTS "Global Results" ON public.event_results;
DROP POLICY IF EXISTS "Public Nexus Feed" ON public.matches;
DROP POLICY IF EXISTS "Public Telemetry Feed" ON public.event_results;
DROP POLICY IF EXISTS "Public Profile Registry" ON public.profiles;

-- 2. IDENTITY CORE (PROFILES): ARCHITECT BYPASS
-- Uses direct JWT app_metadata to prevent table recursion loops.
-- Grants Super Admins global authority to create Sub-Admins and Members.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sovereign Profile Authority" ON public.profiles
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (auth.uid() = id)
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (auth.uid() = id)
);

-- 3. THE NEXUS LEDGER (MATCHES / STAGE / PROVISIONS)
-- Merges "Stage" and "Provisions" logic into a single atomic relation.
-- Sub-Admins are empowered for full CRUD within their JWT-verified Sector.
-- Resolves 401 Unauthorized and RLS_DENIAL on event creation.
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Nexus Sector Empowerment" ON public.matches
FOR ALL TO authenticated
USING (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm')
)
WITH CHECK (
  (auth.jwt() -> 'app_metadata' ->> 'role' IN ('super_admin', 'super_king')) OR 
  (school_arm::text = auth.jwt() -> 'app_metadata' ->> 'school_arm')
);

-- 4. TELEMETRY COMMITS (EVENT RESULTS)
-- Hard-links result provisioning to the parent match's sector node.
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sector Result Provisioning" ON public.event_results
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

-- 5. GLOBAL BROADCAST (READ-ONLY ACCESS)
CREATE POLICY "Public Nexus Feed" ON public.matches FOR SELECT USING (true);
CREATE POLICY "Public Telemetry Feed" ON public.event_results FOR SELECT USING (true);
CREATE POLICY "Public Profile Registry" ON public.profiles FOR SELECT USING (true);

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