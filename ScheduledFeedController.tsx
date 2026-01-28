
import React, { useState } from 'react';
import { supabase } from './supabase';
import { useTacticalData } from './hooks/useTacticalData';
import { useSovereignStore } from './store';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Loader2, 
  Timer,
  ArrowRight
} from 'lucide-react';
import { SchoolArm, MatchType } from './types';

/**
 * ==========================================================
 * SOVEREIGN TACTICAL STAGING: SQL DIRECTIVE V16.2
 * ==========================================================
 * 
 * -- 1. Schema Upgrade
 * ALTER TABLE public.matches 
 * ADD COLUMN IF NOT EXISTS kickoff_at TIMESTAMPTZ,
 * ADD COLUMN IF NOT EXISTS match_type TEXT CHECK (match_type IN ('Track', 'Field', 'House'));
 * 
 * -- 2. Sector Retrieval Engine
 * CREATE OR REPLACE FUNCTION get_active_sector_matches(target_arm TEXT)
 * RETURNS SETOF public.matches AS $$
 * BEGIN
 *     RETURN QUERY 
 *     SELECT * FROM public.matches
 *     WHERE school_arm = target_arm
 *     AND (kickoff_at >= NOW() - INTERVAL '24 hours' OR status = 'live')
 *     ORDER BY kickoff_at ASC;
 * END;
 * $$ LANGUAGE plpgsql STABLE;
 * 
 * -- 3. Protection Protocol
 * CREATE POLICY "Sector Integrity: Block Deletion of Live Events"
 * ON public.matches
 * FOR DELETE
 * TO authenticated
 * USING (
 *     school_arm = (auth.jwt() -> 'user_metadata' ->> 'school_arm')::text 
 *     AND status != 'live'
 * );
 */

const ScheduledFeedController: React.FC = () => {
  const { arm } = useTacticalData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    event_name: '',
    house_a: '',
    house_b: '',
    // FIX: Changed MatchType.House to MatchType.Team to align with enum definition
    match_type: MatchType.Team,
    kickoff_at: '',
  });

  const handleStageEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const kickoffDate = new Date(formData.kickoff_at);
    const now = new Date();

    // TEMPORAL_PARADOX_ERROR: Reject past timelines
    if (kickoffDate < now) {
      setError("TEMPORAL_PARADOX_ERROR: KICKOFF CANNOT EXIST IN PREVIOUS TIMELINE");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        school_arm: arm, // SECTOR LOCK INJECTION
        event_name: formData.event_name.toUpperCase(),
        house_a: formData.house_a,
        house_b: formData.house_b,
        match_type: formData.match_type,
        kickoff_at: kickoffDate.toISOString(),
        status: 'scheduled',
        score_a: 0,
        score_b: 0,
        metadata: {
          participants: [formData.house_a, formData.house_b],
          scores: {}
        }
      };

      const { data, error: insertError } = await supabase
        .from('matches')
        .insert(payload)
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);
      // FIX: Changed MatchType.House to MatchType.Team to align with enum definition
      setFormData({ event_name: '', house_a: '', house_b: '', match_type: MatchType.Team, kickoff_at: '' });
      
      // REAL-TIME BROADCAST: Kickoff Imminent (Within 5-min threshold)
      const diffMs = kickoffDate.getTime() - now.getTime();
      const FIVE_MINUTES_MS = 5 * 60 * 1000;

      if (diffMs <= FIVE_MINUTES_MS) {
        const channel = supabase.channel(`kickoff_broadcast_${data.id}`);
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'KICKOFF_IMMINENT',
              payload: { 
                id: data.id, 
                sector: arm, 
                event: data.event_name,
                kickoff: data.kickoff_at 
              }
            });
            supabase.removeChannel(channel);
          }
        });
      }

    } catch (err: any) {
      setError(`STAGING_FAILURE: ${err.message.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#080808] border border-zinc-900 rounded-[3.5rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-8 duration-700 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
      
      <div className="flex items-center gap-8 mb-16 border-b border-zinc-900 pb-12">
        <div className="p-6 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-3xl shadow-[0_0_40px_rgba(245,158,11,0.1)]">
          <Timer size={40} />
        </div>
        <div className="text-left">
          <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Fixture Staging</h3>
          <div className="flex items-center gap-3 mt-3">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic">Sector Node: {arm}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleStageEvent} className="space-y-12 text-left">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-2 italic">Event Designation</label>
          <input 
            required
            type="text" 
            value={formData.event_name}
            onChange={e => setFormData({...formData, event_name: e.target.value})}
            className="w-full bg-black border border-zinc-900 px-8 py-7 text-white font-black rounded-3xl focus:outline-none focus:border-amber-500 transition-all italic uppercase shadow-inner text-xl placeholder:text-zinc-800"
            placeholder="e.g. SEMI-FINAL TRANSMISSION"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-2 italic">Combatant Alpha</label>
            <input 
              required
              type="text" 
              value={formData.house_a}
              onChange={e => setFormData({...formData, house_a: e.target.value})}
              className="w-full bg-black border border-zinc-900 px-8 py-6 text-white font-black rounded-3xl focus:outline-none focus:border-zinc-700 transition-all italic uppercase text-lg"
              placeholder="HOUSE_A"
            />
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-2 italic">Combatant Beta</label>
            <input 
              required
              type="text" 
              value={formData.house_b}
              onChange={e => setFormData({...formData, house_b: e.target.value})}
              className="w-full bg-black border border-zinc-900 px-8 py-6 text-white font-black rounded-3xl focus:outline-none focus:border-zinc-700 transition-all italic uppercase text-lg"
              placeholder="HOUSE_B"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-2 italic">Match Classification</label>
            <div className="relative">
              <select 
                value={formData.match_type}
                onChange={e => setFormData({...formData, match_type: e.target.value as MatchType})}
                className="w-full bg-black border border-zinc-900 px-8 py-6 text-white font-black rounded-3xl focus:outline-none focus:border-amber-500 transition-all italic uppercase appearance-none cursor-pointer text-lg"
              >
                {/* FIX: Changed MatchType.House to MatchType.Team to align with types.ts enum definition */}
                <option value={MatchType.Team}>HOUSE_MATCH</option>
                <option value={MatchType.Track}>TRACK_EVENT</option>
                <option value={MatchType.Field}>FIELD_EVENT</option>
              </select>
              <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-700 rotate-90" size={24} />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-2 italic">Kickoff (UTC)</label>
            <div className="relative">
              <input 
                required
                type="datetime-local" 
                value={formData.kickoff_at}
                onChange={e => setFormData({...formData, kickoff_at: e.target.value})}
                className="w-full bg-black border border-zinc-900 px-8 py-6 text-white font-black rounded-3xl focus:outline-none focus:border-amber-500 transition-all italic uppercase shadow-inner pr-16 text-lg"
              />
              <Clock className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-700" size={24} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-8 bg-red-950/20 border border-red-900/40 rounded-[2rem] flex items-center gap-6 text-red-500 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95">
            <AlertCircle size={28} /> {error}
          </div>
        )}

        {success && (
          <div className="p-8 bg-emerald-950/20 border border-emerald-900/40 rounded-[2rem] flex items-center gap-6 text-emerald-500 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95">
            <ShieldCheck size={28} /> TELEMETRY_PACKET_COMMITTED
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-10 bg-zinc-900 border border-zinc-800 text-white font-black uppercase italic tracking-[0.8em] rounded-[3rem] hover:bg-amber-600 hover:text-black hover:border-amber-500 transition-all flex items-center justify-center gap-8 group disabled:opacity-20 shadow-2xl active:scale-[0.98] mt-8 text-xl"
        >
          {loading ? <Loader2 className="animate-spin" size={36} /> : (
            <>
              <Zap size={36} className="group-hover:animate-pulse" />
              Stage Transmission
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ScheduledFeedController;
