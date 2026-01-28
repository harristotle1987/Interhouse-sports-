-- ==========================================================
-- SOVEREIGN SECURITY HARDENING PROTOCOL [V115.0 - GLOBAL OVERRIDE]
-- ==========================================================

-- 1. SECURITY INITIALIZATION
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

-- 2. THE GLOBAL SOVEREIGN BYPASS (SUPER ADMIN)
-- Absolute bypass for the 2 Super Admin slots across all school_id/arm values.
DROP POLICY IF EXISTS "Architect: Global Command Bypass" ON public.profiles;
CREATE POLICY "Architect: Global Command Bypass"
ON public.profiles FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_king', 'super_admin')
);

DROP POLICY IF EXISTS "Architect: Global Match Control" ON public.matches;
CREATE POLICY "Architect: Global Match Control"
ON public.matches FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_king', 'super_admin')
);

DROP POLICY IF EXISTS "Architect: Global Results Mastery" ON public.event_results;
CREATE POLICY "Architect: Global Results Mastery"
ON public.event_results FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('super_king', 'super_admin')
);

-- 3. SECTOR ENFORCEMENT: SUB-ADMIN CONSTRAINTS
-- Restricted access for the 9 Sub-Admins (UPSS, CAM, CAGS) to their assigned sectors.
DROP POLICY IF EXISTS "Sector Admin: School-Locked Provisioning" ON public.matches;
CREATE POLICY "Sector Admin: School-Locked Provisioning"
ON public.matches FOR ALL
TO authenticated
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'sub_admin' 
  AND school_arm::text = (SELECT school_arm FROM public.profiles WHERE id = auth.uid())
)
WITH CHECK (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'sub_admin' 
  AND school_arm::text = (SELECT school_arm FROM public.profiles WHERE id = auth.uid())
);

-- 4. MEMBER ACCESS: REGISTRY VISIBILITY
-- Support for 15 administrative heads and 8 members per house (Global Telemetry).
DROP POLICY IF EXISTS "Member: Read-Only Registry" ON public.profiles;
CREATE POLICY "Member: Read-Only Registry"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Member: Read-Only Ledger" ON public.matches;
CREATE POLICY "Member: Read-Only Ledger"
ON public.matches FOR SELECT
TO authenticated
USING (true);

-- 5. THE PURGE RPC (ARCHITECT KILL-SWITCH)
CREATE OR REPLACE FUNCTION purge_all_data()
RETURNS void AS $$
BEGIN
    -- Authorization Check
    IF (SELECT role FROM public.profiles WHERE id = auth.uid()) NOT IN ('super_king', 'super_admin') THEN
        RAISE EXCEPTION 'UNAUTHORIZED_ACCESS: ARCHITECT_CLEARANCE_REQUIRED';
    END IF;

    -- Atomic Truncation
    TRUNCATE public.event_results CASCADE;
    TRUNCATE public.matches CASCADE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;