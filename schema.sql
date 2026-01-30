
-- ==========================================================
-- SOVEREIGN NEXUS PROTOCOL: AUTOMATED SCORING & RLS V143.0
-- ARCHITECT: GOOGLE AI STUDIO (SOVEREIGN SYSTEMS ARCHITECT)
-- ==========================================================

-- 1. CLEAN SLATE: DROP DEPENDENT VIEWS TO PREVENT 42P16 FAULTS
DROP VIEW IF EXISTS public.global_leaderboard;
DROP VIEW IF EXISTS public.medal_tally;
DROP VIEW IF EXISTS public.event_backlog;
DROP VIEW IF EXISTS public.tournament_timeline;

-- 2. HARDEN MATCHES TABLE
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS is_manual_override BOOLEAN DEFAULT false;
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS manual_score INTEGER DEFAULT 0;

-- 3. AUTOMATED SCORING ENGINE: TRIGGERS ON 'FINISHED' STATUS
CREATE OR REPLACE FUNCTION public.process_match_finalization()
RETURNS TRIGGER AS $$
BEGIN
    -- Only trigger when status shifts to 'finished'
    IF (NEW.status = 'finished' AND OLD.status != 'finished') THEN
        -- Assign points to all results linked to this match
        UPDATE public.event_results
        SET points_awarded = CASE 
            -- Manual Override Protocol
            WHEN NEW.is_manual_override AND position = 1 THEN NEW.manual_score
            WHEN NEW.is_manual_override AND position > 1 THEN 0
            -- Standard Group Scaling (25/20/15/10)
            WHEN NEW.scoring_logic = 'Group_Marks' THEN 
                CASE 
                    WHEN position = 1 THEN 25
                    WHEN position = 2 THEN 20
                    WHEN position = 3 THEN 15
                    WHEN position = 4 THEN 10
                    ELSE 0
                END
            -- Standard Single Scaling (15/12/9/6)
            ELSE 
                CASE 
                    WHEN position = 1 THEN 15
                    WHEN position = 2 THEN 12
                    WHEN position = 3 THEN 9
                    WHEN position = 4 THEN 6
                    ELSE 0
                END
        END
        WHERE match_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. BIND THE NEXUS TRIGGER
DROP TRIGGER IF EXISTS trigger_match_finalization ON public.matches;
CREATE TRIGGER trigger_match_finalization
    AFTER UPDATE ON public.matches
    FOR EACH ROW
    EXECUTE FUNCTION public.process_match_finalization();

-- 5. REBUILD TELEMETRY VIEWS
CREATE VIEW public.global_leaderboard AS
SELECT 
    h.id as house_id,
    h.name as house_name,
    h.school_arm,
    h.color,
    COUNT(er.id) FILTER (WHERE er.position = 1) as gold_medals,
    COUNT(er.id) FILTER (WHERE er.position = 2) as silver_medals,
    COUNT(er.id) FILTER (WHERE er.position = 3) as bronze_medals,
    COALESCE(SUM(er.points_awarded), 0) as total_points,
    RANK() OVER (ORDER BY COALESCE(SUM(er.points_awarded), 0) DESC, COUNT(er.id) FILTER (WHERE er.position = 1) DESC) as global_rank
FROM public.houses h
LEFT JOIN public.event_results er ON h.id::text = er.house_id::text
GROUP BY h.id, h.name, h.school_arm, h.color;

CREATE VIEW public.tournament_timeline AS
SELECT 
    m.id as match_id,
    m.event_name,
    m.school_arm,
    m.kickoff_at as scheduled_time,
    m.status,
    m.match_type,
    CASE 
        WHEN m.status = 'finished' THEN m.score_a || ' - ' || m.score_b
        ELSE 'VS'
    END as current_result,
    ha.name as house_a_name,
    ha.color as house_a_color,
    hb.name as house_b_name,
    hb.color as house_b_color
FROM public.matches m
LEFT JOIN public.houses ha ON m.house_a = ha.id
LEFT JOIN public.houses hb ON m.house_b = hb.id;

CREATE VIEW public.event_backlog AS
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
    m.manual_score,
    p.full_name as official_name,
    h.name as winning_house_name,
    h.color as winning_house_color
FROM public.matches m
LEFT JOIN public.profiles p ON m.current_official_id::TEXT = p.id::TEXT
LEFT JOIN public.houses h ON m.winning_house_id::TEXT = h.id::TEXT
WHERE m.status = 'finished'
ORDER BY m.sealed_at DESC;

-- 6. RLS SECURITY: NEXUS ACCESS POLICIES
ALTER TABLE public.event_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Sub_Admin_Result_Management" ON public.event_results;
CREATE POLICY "Sub_Admin_Result_Management" 
ON public.event_results FOR ALL TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_king', 'super_admin'))
  OR (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'sub_admin') 
    AND EXISTS (
      SELECT 1 FROM public.matches m 
      WHERE m.id = event_results.match_id 
      AND m.school_arm = (auth.jwt() -> 'user_metadata' ->> 'school_arm')
    )
  )
);

DROP POLICY IF EXISTS "Sector_Match_Update" ON public.matches;
CREATE POLICY "Sector_Match_Update" 
ON public.matches FOR UPDATE TO authenticated 
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role' IN ('super_king', 'super_admin'))
  OR (
    (auth.jwt() -> 'user_metadata' ->> 'role' = 'sub_admin') 
    AND school_arm = (auth.jwt() -> 'user_metadata' ->> 'school_arm')
  )
);

GRANT SELECT ON public.global_leaderboard TO authenticated;
GRANT SELECT ON public.tournament_timeline TO authenticated;
GRANT SELECT ON public.event_backlog TO authenticated;
NOTIFY pgrst, 'reload schema';
