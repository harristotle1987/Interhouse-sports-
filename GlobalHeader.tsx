
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from './supabase';
import { SchoolArm } from './types';
import { HOUSES } from './constants';
import { Activity } from 'lucide-react';

interface StandingRow {
  house_id: string;
  house_name: string;
  school_arm: SchoolArm;
  color: string;
  wins: number;
  draws: number;
  total_points: number;
}

const GlobalHeader: React.FC = () => {
  const [standings, setStandings] = useState<StandingRow[]>([]);

  const fetchStandings = useCallback(async () => {
    const { data, error } = await supabase.from('global_leaderboard').select('*');
    if (error) {
      console.error("TELEMETRY_FETCH_FAULT", error);
      return;
    }
    if (data) setStandings(data);
  }, []);

  useEffect(() => {
    fetchStandings();

    // REAL-TIME SYNC: Trigger refresh when any match is finished
    const channel = supabase
      .channel('global_telemetry_nexus')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        table: 'matches', 
        schema: 'public', 
        filter: 'status=eq.finished' 
      }, () => {
        fetchStandings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStandings]);

  const telemetry = useMemo(() => {
    const schoolTotals = {
      [SchoolArm.UPSS]: 0,
      [SchoolArm.CAM]: 0,
      [SchoolArm.CAGS]: 0,
    };

    const houseTotals = {
      'Panthers': 0,
      'Vikings': 0,
      'Hawks': 0,
      'Unicorns': 0,
    };

    standings.forEach((s) => {
      // Aggregate School Totals
      if (s.school_arm in schoolTotals) {
        schoolTotals[s.school_arm] += s.total_points;
      }
      
      // Aggregate Archetype Totals (Combined across sectors)
      if (s.house_name.includes('Panthers')) houseTotals['Panthers'] += s.total_points;
      else if (s.house_name.includes('Vikings')) houseTotals['Vikings'] += s.total_points;
      else if (s.house_name.includes('Hawks')) houseTotals['Hawks'] += s.total_points;
      else if (s.house_name.includes('Unicorns')) houseTotals['Unicorns'] += s.total_points;
    });

    return { schoolTotals, houseTotals };
  }, [standings]);

  return (
    <div className="sticky top-0 z-[60] w-full bg-slate-950/40 backdrop-blur-2xl border-b border-white/5 p-4 md:px-10 shadow-2xl transition-all duration-700">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* School Node Telemetry */}
        <div className="flex items-center gap-12 overflow-x-auto no-scrollbar w-full md:w-auto px-2">
          {Object.entries(telemetry.schoolTotals).map(([arm, total]) => (
            <div key={arm} className="flex flex-col items-start min-w-[100px] group cursor-default">
              <span className="text-zinc-500 font-black uppercase text-[8px] tracking-[0.4em] mb-2 italic group-hover:text-emerald-500 transition-colors">
                {arm} NODE
              </span>
              <span className="text-2xl font-black text-white tracking-tighter tabular-nums leading-none font-mono group-hover:text-emerald-400 transition-colors">
                {total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Global Identity Feed */}
        <div className="flex items-center gap-10 md:gap-16 overflow-x-auto no-scrollbar w-full md:w-auto px-2 py-1">
          {Object.entries(telemetry.houseTotals).map(([name, total]) => {
            const houseColor = HOUSES.find(h => h.name.includes(name))?.color || '#000';
            return (
              <div key={name} className="flex items-center gap-5 min-w-[130px] group cursor-default">
                <div 
                  className="w-1.5 h-10 rounded-full transition-all group-hover:scale-y-110 shadow-[0_0_15px_rgba(255,255,255,0.1)]" 
                  style={{ 
                    backgroundColor: houseColor,
                    boxShadow: `0 0 20px ${houseColor}44`
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-zinc-600 font-black uppercase text-[9px] tracking-[0.3em] block mb-1.5 leading-none italic group-hover:text-white transition-colors">
                    {name}
                  </span>
                  <span className="text-xl md:text-2xl font-black text-white tabular-nums tracking-tighter leading-none font-mono group-hover:text-emerald-400 transition-colors">
                    {total.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Status Uplink Badge */}
        <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full hover:bg-emerald-500/10 transition-all cursor-default">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 italic leading-none">TRANSMISSION_SECURE</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalHeader;
