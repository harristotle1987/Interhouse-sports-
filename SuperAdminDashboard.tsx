
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, RefreshCw, Users, Database, Globe, Lock, ShieldAlert, 
  Zap, ZapOff, CheckCircle2, Loader2, Activity, Radio, Biohazard, 
  Plus, Calendar, Timer, UserPlus, Fingerprint 
} from 'lucide-react';
import { useSovereignStore } from './store';
import { AdminRole, SchoolArm, LiveMatch, MatchType } from './types';
import { useOperativeLedger } from './hooks/useOperativeLedger';
import AdminProvisioning from './AdminProvisioning';
import ScheduledFeedController from './ScheduledFeedController';
import { supabase } from './supabase';

/**
 * SOVEREIGN NEXUS CENTER [V143.0]
 * Unified Command for Staging, Provisioning, and Override Protocols.
 */
const GlobalTelemetryMonitor: React.FC = () => {
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalFeeds = useCallback(async () => {
    try {
      const { data } = await supabase
        .from('matches')
        .select('*')
        .in('status', ['live', 'paused'])
        .order('created_at', { ascending: false });
      
      if (data) setActiveMatches(data);
    } catch (e) {
      console.error("TELEMETRY_SCAN_FAULT", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGlobalFeeds();
    
    // HARDENED LISTENER: Payload protection protocol
    const channel = supabase
      .channel('global_telemetry_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, (packet) => {
        // Correcting TypeError by checking packet existance and ignoring data object for safety
        if (packet) fetchGlobalFeeds();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchGlobalFeeds]);

  return (
    <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl text-left overflow-hidden relative group">
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <Activity className="text-emerald-500 animate-pulse" size={24} />
          <h3 className="text-lg font-black text-white uppercase italic tracking-widest">Global Stream</h3>
        </div>
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{activeMatches.length} ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 gap-3 relative z-10 max-h-[300px] overflow-y-auto no-scrollbar pr-1">
        {loading ? (
          <div className="flex items-center gap-3 text-zinc-600 py-6">
            <Loader2 className="animate-spin" size={16} />
            <span className="text-[10px] font-black uppercase">Scanning Sectors...</span>
          </div>
        ) : activeMatches.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">No Transmission Detected</span>
          </div>
        ) : (
          activeMatches.map(match => (
            <div key={match.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-all border-l-4 border-l-emerald-500/50">
              <div className="flex flex-col gap-0.5">
                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{match.school_arm} SECTOR</span>
                <span className="text-xs font-black text-white uppercase italic truncate max-w-[150px]">{match.event_name}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-white tabular-nums italic">{match.score_a} - {match.score_b}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const { user } = useSovereignStore();
  const { operatives, loading: listLoading, refetch: refetchLedger } = useOperativeLedger();
  const [activeSubTab, setActiveSubTab] = useState<'staging' | 'provisioning' | 'override'>('staging');

  if (!user || user.role !== AdminRole.SUPER_KING) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-12">
        <div className="flex items-center gap-8">
          <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
            <Shield size={40} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Nexus Command</h1>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                <Globe size={12} className="text-indigo-600" />
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest">Global Authority</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">Architect Session v143.0</p>
            </div>
          </div>
        </div>
        
        {/* SUB-NAV SWITCHER */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl self-start lg:self-center">
          <button 
            onClick={() => setActiveSubTab('staging')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeSubTab === 'staging' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Calendar size={14} className="inline mr-2 mb-0.5" /> Staging
          </button>
          <button 
            onClick={() => setActiveSubTab('provisioning')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeSubTab === 'provisioning' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <UserPlus size={14} className="inline mr-2 mb-0.5" /> Provision
          </button>
          <button 
            onClick={() => setActiveSubTab('override')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all ${activeSubTab === 'override' ? 'bg-red-500 text-white shadow-md' : 'text-slate-500 hover:text-red-500'}`}
          >
            <ShieldAlert size={14} className="inline mr-2 mb-0.5" /> Overrides
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-12">
        {/* LEFT COLUMN: ACTIVE MONITOR & ACTION PANEL */}
        <div className="xl:col-span-5 space-y-8">
          <GlobalTelemetryMonitor />
          
          <div className="animate-in fade-in zoom-in-95 duration-500">
            {activeSubTab === 'staging' && <ScheduledFeedController />}
            {activeSubTab === 'provisioning' && <AdminProvisioning />}
            {activeSubTab === 'override' && (
               <div className="space-y-6">
                  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl text-left">
                    <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-widest mb-6 flex items-center gap-3"><ZapOff className="text-amber-500" /> Sector Lockdown</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-8">Force seal all telemetry streams for specific nodes.</p>
                    <div className="space-y-3">
                      {[SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS].map(arm => (
                        <button key={arm} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between hover:bg-zinc-900 hover:text-white transition-all group">
                          <span className="text-xs font-black uppercase italic tracking-widest">Terminate {arm} Node</span>
                          <Lock size={14} className="opacity-30 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bg-red-950/80 p-8 rounded-[2.5rem] border border-red-500/20 text-white shadow-2xl">
                     <div className="flex items-center gap-3 mb-4">
                        <Biohazard className="text-red-400" />
                        <h3 className="text-lg font-black uppercase italic tracking-widest">Kill-Switch</h3>
                     </div>
                     <p className="text-[10px] font-black text-red-300 uppercase tracking-widest italic mb-6">Purge all non-production telemetry packets.</p>
                     <button className="w-full py-4 bg-red-600 rounded-xl font-black uppercase italic tracking-[0.4em] text-[10px] hover:bg-red-500 transition-all">Authorize Purge</button>
                  </div>
               </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: PERSONNEL DATABASE */}
        <div className="xl:col-span-7">
          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm"><Users size={24} className="text-slate-400" /></div>
                <div>
                  <h3 className="text-xl font-black uppercase italic text-slate-900 tracking-tight">Identity Ledger</h3>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic mt-0.5">Personnel Node Core</p>
                </div>
              </div>
              <button onClick={() => refetchLedger()} className="p-4 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:shadow-lg transition-all">
                <RefreshCw size={24} className={listLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 backdrop-blur-md sticky top-0 z-10">
                  <tr>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em] border-b border-slate-100">Operative</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em] border-b border-slate-100">Clearance</th>
                    <th className="p-6 text-[10px] font-black uppercase text-slate-400 italic tracking-[0.2em] border-b border-slate-100 text-right">Sector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {operatives.map(op => (
                    <tr key={op.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border border-white group-hover:bg-indigo-600 group-hover:text-white transition-all">{op.full_name?.charAt(0)}</div>
                          <div className="flex flex-col">
                            <span className="font-black text-slate-900 uppercase italic text-sm">{op.full_name}</span>
                            <span className="text-[9px] text-slate-400 font-mono lowercase opacity-60">{op.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase italic border ${op.role === 'super_king' ? 'bg-indigo-900 text-white border-indigo-900' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {op.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span className="font-black text-slate-900 italic text-xs uppercase tracking-widest">{op.school_arm}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
