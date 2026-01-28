
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from './supabase';
import { SchoolArm, LiveMatch, Directive, AdminUser, NexusEvent, BacklogEvent, ScoringType } from './types';
import { HOUSES } from './constants';
import { 
  Activity,
  Calendar,
  Clock,
  XCircle,
  BarChart3,
  UserCheck,
  Award
} from 'lucide-react';
import { useSovereignStore } from './store';
import { useLiveTimer } from './hooks/useLiveTimer';
import { FixtureCountdown } from './FixtureCountdown';

const LiveMatchCard: React.FC<{ match: any }> = ({ match }) => {
  const { timeLeft } = useLiveTimer(match.created_at || null, match.duration_minutes || 15, match.status, match.metadata);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevVersion = useRef(match.version);

  const isActive = match.status === 'live';
  const isPaused = match.status === 'paused';
  const isCancelled = match.status === 'cancelled';

  const houseAId = match.house_a || match.metadata?.participants?.[0];
  const houseBId = match.house_b || match.metadata?.participants?.[1];
  const scoreA = match.house_a ? match.score_a : (match.metadata?.scores?.[houseAId || ''] || 0);
  const scoreB = match.house_b ? match.score_b : (match.metadata?.scores?.[houseBId || ''] || 0);

  const houseA = HOUSES.find(h => h.id === houseAId);
  const houseB = HOUSES.find(h => h.id === houseBId);

  useEffect(() => {
    if (match.version > prevVersion.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 2000);
      prevVersion.current = match.version;
      return () => clearTimeout(timer);
    }
  }, [match.version]);

  return (
    <div className={`bg-[#0a0a0a] border rounded-[2rem] p-6 relative overflow-hidden transition-all duration-700 group text-left ${
      isCancelled ? 'opacity-40 grayscale border-red-900/20' : 
      isPulsing ? 'border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)]' :
      isActive ? 'border-zinc-800 shadow-[0_0_25px_rgba(0,0,0,1)]' : 'border-zinc-900'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${
          isActive ? 'bg-emerald-500 text-black' : 
          isPaused ? 'bg-amber-500 text-black' : 
          isCancelled ? 'bg-red-500 text-black' : 'bg-zinc-800 text-zinc-400'
        }`}>
          {isCancelled ? <XCircle size={10} /> : <Activity size={10} className={isActive ? 'animate-pulse' : ''} />}
          {isActive ? 'LIVE' : isPaused ? 'PAUSED' : isCancelled ? 'TERMINATED' : 'WAITING'}
        </div>
        {!isCancelled && (
          <div className="font-mono text-sm font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-xl border border-emerald-500/10">
            {timeLeft}
          </div>
        )}
      </div>

      <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-8 leading-tight italic group-hover:text-emerald-400 transition-colors">
        {match.event_name}
      </h3>

      {houseAId && houseBId ? (
        <div className="flex items-center justify-between gap-4 relative">
          <div className="flex-1 flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/5" style={{ backgroundColor: houseA?.color || '#333' }}>
               {houseA?.name?.[0] || '?'}
             </div>
             <span className={`text-4xl font-black text-white tabular-nums leading-none tracking-tighter italic transition-all duration-500 ${isPulsing ? 'scale-125 text-emerald-400' : ''}`}>
               {scoreA}
             </span>
          </div>
          <div className="text-[10px] font-black text-zinc-800 italic uppercase tracking-widest">vs</div>
          <div className="flex-1 flex flex-col items-center gap-2">
             <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg border border-white/5" style={{ backgroundColor: houseB?.color || '#333' }}>
               {houseB?.name?.[0] || '?'}
             </div>
             <span className={`text-4xl font-black text-white tabular-nums leading-none tracking-tighter italic transition-all duration-500 ${isPulsing ? 'scale-125 text-emerald-400' : ''}`}>
               {scoreB}
             </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
           {HOUSES.filter(h => h.arm === match.school_arm).map(h => (
              <div key={h.id} className="bg-zinc-900/50 p-2 rounded-lg flex items-center justify-between border border-zinc-800">
                <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter pl-1">{h.name.split(' ')[1]}</span>
                <span className={`text-xl font-black text-white tabular-nums italic ${isPulsing ? 'text-emerald-400' : ''}`}>
                  {match.metadata?.scores?.[h.id] || 0}
                </span>
              </div>
           ))}
        </div>
      )}
    </div>
  );
};


export default function MemberDashboard() {
  const { user } = useSovereignStore();
  const [liveMatches, setLiveMatches] = useState<any[]>([]);
  const [scheduledMatches, setScheduledMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTelemetry = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true });
    
    if (data) {
      setLiveMatches(data.filter(m => ['live', 'paused', 'cancelled'].includes(m.status)));
      setScheduledMatches(data.filter(m => m.status === 'scheduled'));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
    
    const matchChannel = supabase
      .channel(`nexus_global_uplink_mobile`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => fetchTelemetry())
      .subscribe();

    return () => {
      supabase.removeChannel(matchChannel);
    };
  }, [user?.arm]);

  return (
    <div className="space-y-12 pb-16 text-left">
      <div>
        <div className="flex items-center gap-3 mb-6 px-2">
            <Activity size={16} className="text-emerald-500 animate-pulse" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 italic">Live & Paused Events</h3>
        </div>
        {loading ? (
           <div className="text-center py-20 text-zinc-700 text-xs uppercase font-bold tracking-widest">Syncing Telemetry...</div>
        ) : liveMatches.length === 0 ? (
           <div className="text-center py-20 text-zinc-700 text-xs uppercase font-bold tracking-widest opacity-50">No Active Transmissions</div>
        ) : (
           <div className="grid md:grid-cols-2 gap-6">
              {liveMatches.map(m => <LiveMatchCard key={m.id} match={m} />)}
           </div>
        )}
      </div>

      <div className="pt-8">
        <div className="flex items-center gap-3 mb-6 px-2">
            <Calendar size={16} className="text-amber-500" />
            <h3 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-400 italic">Scheduled Feed</h3>
        </div>
        <div className="grid gap-4">
           {scheduledMatches.length === 0 ? (
             <div className="text-center py-16 text-zinc-700 text-xs uppercase font-bold tracking-widest opacity-50">Staging Buffer Empty</div>
           ) : (
             scheduledMatches.map(m => (
               <div key={m.id} className="bg-[#0a0a0a] border border-zinc-900 p-5 rounded-[1.5rem] flex items-center justify-between group text-left">
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-zinc-900 border border-zinc-800 text-amber-500 rounded-xl shadow-inner">
                        <Clock size={20} />
                     </div>
                     <div>
                        <h4 className="text-md font-black text-white uppercase italic tracking-tighter">{m.event_name}</h4>
                        <div className="mt-1">
                           <FixtureCountdown startTime={m.kickoff_at!} />
                        </div>
                     </div>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}
