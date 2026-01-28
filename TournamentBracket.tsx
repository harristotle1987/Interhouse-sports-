
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  ChevronRight, 
  Crown, 
  Shield, 
  GitPullRequest, 
  ArrowRight, 
  Lock,
  Activity,
  Clock,
  Loader2,
  Globe
} from 'lucide-react';
import { supabase } from './supabase';
import { AdminRole, SchoolArm } from './types';

interface TournamentTimelineEvent {
  match_id: string;
  event_name: string;
  school_arm: SchoolArm;
  scheduled_time: string;
  status: 'scheduled' | 'live' | 'paused' | 'finished' | 'cancelled';
  match_type: string;
  current_result: string;
  house_a_name: string;
  house_a_color: string;
  house_b_name: string;
  house_b_color: string;
}

// FIX: Define a props interface for MatchCard and type it as a React.FC
// to resolve TypeScript errors with the special 'key' prop in lists.
interface MatchCardProps {
  e: TournamentTimelineEvent;
}

// Fixed: Moved MatchCard outside of the main component to prevent prop validation errors with 'key'
// and to improve performance by not re-defining the component on every render.
const MatchCard: React.FC<MatchCardProps> = ({ e }) => (
  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:border-indigo-200 transition-all hover:shadow-xl text-left">
    <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
      <div className="flex items-center gap-3">
         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 italic">{e.school_arm} NODE</span>
         <div className="w-1 h-1 rounded-full bg-slate-300" />
         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">{e.match_type}</span>
      </div>
      {e.status === 'live' ? (
        <div className="flex items-center gap-2 px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full animate-pulse">
          <Activity size={10} className="text-emerald-600" />
          <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">TRANSMISSION_LIVE</span>
        </div>
      ) : e.status === 'finished' ? (
        <div className="flex items-center gap-2 px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-full">
          <Shield size={10} className="text-indigo-400" />
          <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">RESULT_FIXED</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 opacity-50">
          <Clock size={10} className="text-slate-400" />
          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">STAGED</span>
        </div>
      )}
    </div>

    <div className="p-8">
      <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter mb-8 group-hover:text-indigo-600 transition-colors">{e.event_name}</h4>
      
      <div className="flex items-center justify-between gap-6 relative">
        <div className="flex flex-col items-center flex-1 gap-3">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg" style={{ backgroundColor: e.house_a_color || '#eee' }}>
              {e.house_a_name?.[0] || '?'}
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase truncate w-full text-center tracking-tight">{e.house_a_name?.split(' ')[1] || 'TBD'}</span>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
           <span className="text-3xl font-black text-slate-900 tabular-nums italic">{e.current_result}</span>
           {e.status === 'scheduled' && <span className="text-[8px] font-mono text-slate-400">{new Date(e.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>

        <div className="flex flex-col items-center flex-1 gap-3">
           <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-lg" style={{ backgroundColor: e.house_b_color || '#eee' }}>
              {e.house_b_name?.[0] || '?'}
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase truncate w-full text-center tracking-tight">{e.house_b_name?.split(' ')[1] || 'TBD'}</span>
        </div>
      </div>
    </div>
  </div>
);

const TournamentBracket: React.FC = () => {
  const [events, setEvents] = useState<TournamentTimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTimeline = async () => {
    const { data, error } = await supabase
      .from('tournament_timeline')
      .select('*');
    
    if (data) setEvents(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTimeline();
    const channel = supabase
      .channel('bracket_realtime_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchTimeline())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-6">
        <Loader2 className="animate-spin text-indigo-500" size={48} />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Syncing Global Timeline...</p>
      </div>
    );
  }

  const sections = {
    live: events.filter(e => e.status === 'live' || e.status === 'paused'),
    scheduled: events.filter(e => e.status === 'scheduled'),
    past: events.filter(e => e.status === 'finished')
  };

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
      <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-12 text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 border border-indigo-500/30 rounded-lg">
                 <GitPullRequest size={20} className="text-indigo-400" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Biennial Championship Timeline</span>
           </div>
           <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
              TOURNAMENT<span className="text-indigo-400">.CORE</span>
           </h2>
           <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
                 <Globe size={16} className="text-indigo-400" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Consolidated: UPSS | CAM | CAGS</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         {/* LIVE HUB */}
         <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
               <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 italic">Live Operations</h3>
            </div>
            <div className="space-y-6">
               {sections.live.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30 italic text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Telemetry</div>
               ) : sections.live.map(e => <MatchCard key={e.match_id} e={e} />)}
            </div>
         </div>

         {/* STAGING AREA */}
         <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-3 h-3 rounded-full bg-amber-500" />
               <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 italic">Scheduled Events</h3>
            </div>
            <div className="space-y-6">
               {sections.scheduled.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30 italic text-[10px] font-black text-slate-400 uppercase tracking-widest">Staging Buffer Empty</div>
               ) : sections.scheduled.map(e => <MatchCard key={e.match_id} e={e} />)}
            </div>
         </div>

         {/* ARCHIVE FEED */}
         <div className="space-y-8">
            <div className="flex items-center gap-4 px-4">
               <div className="w-3 h-3 rounded-full bg-indigo-500" />
               <h3 className="text-sm font-black uppercase tracking-[0.4em] text-slate-400 italic">Result Archive</h3>
            </div>
            <div className="space-y-6">
               {sections.past.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-center opacity-30 italic text-[10px] font-black text-slate-400 uppercase tracking-widest">No Fixed Records</div>
               ) : sections.past.map(e => <MatchCard key={e.match_id} e={e} />)}
            </div>
         </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
