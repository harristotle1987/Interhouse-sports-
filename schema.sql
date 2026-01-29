
-- ==========================================================
-- SOVEREIGN NEXUS PROTOCOL: OVERRIDE & PERSISTENCE V43.Nexus
-- ARCHITECT: GOOGLE AI STUDIO (ELITE BACKEND COMMAND)
-- ==========================================================

-- 1. SCHEMA INTEGRATION: OVERRIDE COMMANDS
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS manual_points_awarded INT DEFAULT 0;

-- 2. RE-ENGINEERED MEDAL TALLY: WEIGHTED SCORING WITH OVERRIDE BYPASS
-- Logic: If override is active, apply manual_points_awarded to the winner (position 1).
-- Automated fallback scales: 25/20/15/10 (Group) | 15/12/9/6 (Single).
CREATE OR REPLACE VIEW public.medal_tally AS
SELECT 
    h.id::TEXT as house_id,
    h.name as house_name,
    h.school_arm,
    h.color,
    COUNT(er.id) FILTER (WHERE er.position = 1) as gold_medals,
    COUNT(er.id) FILTER (WHERE er.position = 2) as silver_medals,
    COUNT(er.id) FILTER (WHERE er.position = 3) as bronze_medals,
    COUNT(er.id) FILTER (WHERE er.position = 4) as fourth_place,
    COALESCE(SUM(
        CASE 
            WHEN m.is_manual_override THEN
                CASE WHEN er.position = 1 THEN m.manual_points_awarded ELSE 0 END
            WHEN m.match_type IN ('Team', 'Relay', 'Group') THEN
                CASE 
                    WHEN er.position = 1 THEN 25
                    WHEN er.position = 2 THEN 20
                    WHEN er.position = 3 THEN 15
                    WHEN er.position = 4 THEN 10
                    ELSE 0
                END
            ELSE
                CASE 
                    WHEN er.position = 1 THEN 15
                    WHEN er.position = 2 THEN 12
                    WHEN er.position = 3 THEN 9
                    WHEN er.position = 4 THEN 6
                    ELSE 0
                END
        END
    ), 0) as total_points
FROM public.houses h
LEFT JOIN public.event_results er ON h.id::TEXT = er.house_id::TEXT
LEFT JOIN public.matches m ON er.match_id::TEXT = m.id::TEXT
GROUP BY h.id, h.name, h.school_arm, h.color;

-- 3. THE "ETERNAL BACKLOG" VIEW
-- Retrieves ALL finished events for universal historical transparency.
CREATE OR REPLACE VIEW public.event_backlog AS
SELECT 
    m.id::TEXT as match_id,
    m.event_name,
    m.description,
    m.status,
    m.school_arm,
    m.match_type,
    m.score_a,
    m.score_b,
    m.kickoff_at,
    m.sealed_at as completed_at,
    m.is_manual_override,
    m.manual_points_awarded,
    p.full_name as official_name,
    h.name as winning_house_name,
    h.color as winning_house_color
FROM public.matches m
LEFT JOIN public.profiles p ON m.current_official_id::TEXT = p.id::TEXT
LEFT JOIN public.houses h ON m.winning_house_id::TEXT = h.id::TEXT
WHERE m.status = 'finished'
ORDER BY m.sealed_at DESC;

-- 4. SECURITY PROTOCOL: MANUAL OVERRIDE CONTROL
-- Enforces sector-lockdown for sub-admins and universal authority for super-admins.
DROP POLICY IF EXISTS "Admin_Manual_Override_Control" ON public.matches;
CREATE POLICY "Admin_Manual_Override_Control" 
ON public.matches 
FOR UPDATE 
TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_king', 'super_admin', 'sub_admin'))
  AND (
    (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_king', 'super_admin')) 
    OR (auth.jwt() -> 'user_metadata' ->> 'school_arm' = school_arm)
  )
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_king', 'super_admin', 'sub_admin'))
);

-- 5. CACHE & PROTOCOL RELOAD
GRANT SELECT ON public.event_backlog TO authenticated;
NOTIFY pgrst, 'reload schema';

COMMENT ON VIEW public.event_backlog IS 'SOVEREIGN ETERNAL BACKLOG: FULL HISTORICAL LEDGER';
