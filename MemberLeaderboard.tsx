
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { SchoolArm, Standing } from './types';
import { useSovereignStore } from './store';
import { 
  Loader2,
  ShieldCheck,
  Globe,
  Monitor,
  Star,
  Activity,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  BarChart3
} from 'lucide-react';

const MemberLeaderboard: React.FC = () => {
  const { user } = useSovereignStore();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStandings = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('global_leaderboard')
        .select('*')
        .order('global_rank', { ascending: true });
      
      if (error) throw error;
      if (data) setStandings(data);
    } catch (e) {
      console.warn("LEADERBOARD_FETCH_FAULT:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStandings();

    const channel = supabase
      .channel('ceremony_leaderboard_sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_results' }, () => fetchStandings())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, () => fetchStandings())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 gap-6 bg-black min-h-screen">
        <Loader2 className="animate-spin text-emerald-500" size={48} />
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.6em] italic animate-pulse">Syncing Ceremony Telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-32">
      <div className="bg-[#0a0a0a] border border-zinc-800 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-12 text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                 <Globe size={20} className="text-indigo-500" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-500 italic">Global Championship Ledger</span>
           </div>
           <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-none">
              STANDINGS<span className="text-zinc-800">.CORE</span>
           </h2>
           <div className="flex items-center gap-6 mt-8">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full">
                 <ShieldCheck size={16} className="text-emerald-500" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest italic">Protocol: RLS_TRANS_SELECT</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-full">
                 <div className={`w-2 h-2 rounded-full ${refreshing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
                 <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">Uplink: {refreshing ? 'STREAMING' : 'NOMINAL'}</span>
              </div>
           </div>
        </div>
        
        <div className="relative z-10 p-10 bg-zinc-900/50 border border-zinc-800 rounded-[3rem] flex items-center gap-8 group">
           <Trophy size={48} className="text-amber-500 transition-transform group-hover:scale-110" />
           <div className="text-left">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-1 italic">Closing Ceremony Standings</span>
              <span className="text-3xl font-black text-white uppercase italic tracking-tighter">FINAL PROTOCOL</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {standings.map((row) => {
          const isOwnSector = row.school_arm === user?.arm;
          const isWinner = row.global_rank === 1;

          return (
            <div 
              key={row.house_id} 
              className={`group bg-[#0a0a0a] border rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-10 transition-all hover:bg-zinc-900/40 relative overflow-hidden ${isOwnSector ? 'border-indigo-500/30' : 'border-zinc-900'} ${isWinner ? 'shadow-[0_0_100px_rgba(245,158,11,0.05)]' : ''}`}
            >
               <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: row.color }}></div>
               
               <div className="flex items-center gap-10 flex-1">
                  <div className="flex items-center gap-6">
                     <span className={`text-5xl font-black italic tabular-nums leading-none ${isWinner ? 'text-amber-500' : 'text-zinc-800 group-hover:text-white'}`}>
                        #{row.global_rank}
                     </span>
                     <div 
                       className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl border border-white/5 transition-transform group-hover:scale-110" 
                       style={{ backgroundColor: row.color }}
                     >
                        {row.house_name[0]}
                     </div>
                  </div>
                  <div className="text-left">
                     <div className="flex items-center gap-3 mb-2">
                        <span className={`px-4 py-1 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] italic border transition-all ${
                          isOwnSector ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-900 text-zinc-600 border-zinc-800'
                        }`}>
                           {row.school_arm} SECTOR
                        </span>
                        {isWinner && <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic animate-pulse">Championship Leader</span>}
                     </div>
                     <h4 className={`text-3xl font-black uppercase italic tracking-tight ${isWinner ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>
                        {row.house_name}
                     </h4>
                  </div>
               </div>

               <div className="flex items-center gap-12">
                  <div className="flex items-center gap-8">
                     <div className="flex flex-col items-center gap-2">
                        <Medal size={22} className="text-amber-400" />
                        <span className="text-amber-400 font-black text-2xl tabular-nums">{row.gold_medals}</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <Medal size={22} className="text-slate-300" />
                        <span className="text-slate-300 font-black text-2xl tabular-nums">{row.silver_medals}</span>
                     </div>
                     <div className="flex flex-col items-center gap-2">
                        <Medal size={22} className="text-amber-700" />
                        <span className="text-amber-700 font-black text-2xl tabular-nums">{row.bronze_medals}</span>
                     </div>
                  </div>
                  
                  <div className="text-right border-l border-zinc-900 pl-12 flex flex-col items-end">
                     <div className="flex items-center gap-3">
                        <BarChart3 size={20} className="text-emerald-500/50" />
                        <span className={`text-6xl font-black italic tabular-nums leading-none ${isWinner ? 'text-emerald-500' : 'text-white'}`}>
                           {row.total_points}
                        </span>
                     </div>
                     <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em] mt-3 italic">Final Ceremony Score</span>
                  </div>
               </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-12 bg-[#070707] border border-zinc-900 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-10">
         <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
               <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[10px] font-black text-emerald-500">G</div>
               <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Group: 25/20/15/10</span>
            </div>
            <div className="flex items-center gap-4">
               <div className="w-5 h-5 rounded-md bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-[10px] font-black text-indigo-500">S</div>
               <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest italic">Single: 15/12/9/6</span>
            </div>
         </div>
         <div className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em] italic">
            Broadcast Protocol: V44.0 Hardened Atomic Engine
         </div>
      </div>
    </div>
  );
};

export default MemberLeaderboard;
