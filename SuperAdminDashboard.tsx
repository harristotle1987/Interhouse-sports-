
import React, { useState, useEffect } from 'react';
import { Shield, RefreshCw, Users, Database, Globe, Lock, ShieldAlert, Zap, CheckCircle2, Loader2, Award, ZapOff, Monitor, Activity, Radio, Biohazard } from 'lucide-react';
import { useSovereignStore } from './store';
import { AdminRole, SchoolArm, LiveMatch } from './types';
import { useOperativeLedger } from './hooks/useOperativeLedger';
import AdminProvisioning from './AdminProvisioning';
import { supabase } from './supabase';

const GlobalTelemetryMonitor: React.FC = () => {
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGlobalFeeds = async () => {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .in('status', ['live', 'paused'])
      .order('created_at', { ascending: false });
    
    if (data) setActiveMatches(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchGlobalFeeds();
    const channel = supabase
      .channel('global_telemetry_hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
        fetchGlobalFeeds();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="bg-slate-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl text-left overflow-hidden relative">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Radio size={120} className="text-indigo-500" />
      </div>
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Activity className="text-emerald-500 animate-pulse" size={24} />
        <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Global Telemetry Stream</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 relative z-10 max-h-[400px] overflow-y-auto no-scrollbar custom-scrollbar pr-2">
        {loading ? (
          <div className="flex items-center gap-3 text-zinc-500 py-10">
            <Loader2 className="animate-spin" size={18} />
            <span className="text-[10px] font-black uppercase tracking-widest">Scanning Sectors...</span>
          </div>
        ) : activeMatches.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 italic">No Active Transmissions Detected</span>
          </div>
        ) : (
          activeMatches.map(match => (
            <div key={match.id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${match.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{match.school_arm} SECTOR</span>
                </div>
                <span className="text-sm font-black text-white uppercase italic">{match.event_name}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-white tabular-nums italic">
                  {match.score_a} - {match.score_b}
                </span>
                <span className="block text-[8px] font-black text-zinc-600 uppercase tracking-widest mt-1">Live Feed</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const SectorLockdown: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<{ school: string; count: number } | null>(null);

  const handleForceSeal = async (school: SchoolArm) => {
    if (!confirm(`TACTICAL_OVERRIDE: This will immediately FINISH all active and staged telemetry for ${school}. This is irreversable.`)) return;

    setLoading(school);
    setResults(null);
    try {
      const { data, error } = await supabase.rpc('seal_all_school_events', {
        target_school: school
      });

      if (error) throw error;
      setResults({ school, count: (data as any).sealed_count });
      setTimeout(() => setResults(null), 8000);
    } catch (err: any) {
      alert(`OVERRIDE_FAULT: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl text-left">
      <div className="flex items-center gap-4 mb-8">
        <ShieldAlert className="text-red-600" size={28} />
        <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">Architect Override</h3>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-10 leading-relaxed">
        Immediate Ledger Termination Protocol. Used to finalize all sectors prior to the closing ceremony broadcast.
      </p>

      <div className="space-y-4">
        {[SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS].map(school => (
          <button
            key={school}
            disabled={!!loading}
            onClick={() => handleForceSeal(school)}
            className="w-full p-6 bg-slate-50 hover:bg-zinc-900 hover:text-white border border-slate-100 hover:border-zinc-800 rounded-2xl flex items-center justify-between transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <ZapOff className="text-slate-300 group-hover:text-amber-500" size={18} />
              <span className="text-sm font-black uppercase italic tracking-wider">Seal {school} Sector</span>
            </div>
            {loading === school ? <Loader2 className="animate-spin text-amber-500" size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-200 group-hover:bg-amber-500" />}
          </button>
        ))}
      </div>

      {results && (
        <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 text-emerald-700 text-[10px] font-black uppercase italic animate-in zoom-in-95">
          <CheckCircle2 size={20} />
          {results.school} Node Purged: {results.count} Record Streams Sealed.
        </div>
      )}
    </div>
  );
};

const KillSwitchProtocol: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');

  const handlePurge = async () => {
    if (confirmation !== 'PURGE') {
      setError('CONFIRMATION TEXT MISMATCH.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const { error: rpcError } = await supabase.rpc('purge_mock_data');
      if (rpcError) throw rpcError;
      setSuccess('MOCK DATA PURGED. SYSTEM RESET. RELOADING...');
      setTimeout(() => window.location.reload(), 2000);
    } catch (err: any) {
      setError(`KILL-SWITCH FAULT: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-950/80 p-10 rounded-[3rem] border-2 border-dashed border-red-500/30 text-left shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Biohazard className="text-red-400" size={28} />
        <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Kill-Switch Protocol</h3>
      </div>
      <p className="text-[10px] font-black text-red-300 uppercase tracking-widest italic mb-6 leading-relaxed">
        This command surgically removes all test entries from `matches` and `event_results`. This action is irreversible.
      </p>
      
      <div className="space-y-6">
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="TYPE 'PURGE' TO ARM"
          className="w-full bg-black/50 border-2 border-red-500/30 px-6 py-4 text-white font-black rounded-2xl focus:outline-none focus:border-red-500 transition-all uppercase italic text-sm shadow-inner placeholder:text-red-500/30 text-center"
        />
        <button
          onClick={handlePurge}
          disabled={loading || confirmation !== 'PURGE'}
          className="w-full py-5 bg-red-600 text-white border border-red-400 rounded-2xl font-black uppercase italic tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-red-500 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Authorize Full Purge'}
        </button>
      </div>

      {error && (
        <div className="mt-6 p-4 bg-black/30 rounded-lg text-red-400 text-[10px] font-mono animate-in zoom-in-95">{error}</div>
      )}
      {success && (
        <div className="mt-6 p-4 bg-black/30 rounded-lg text-emerald-400 text-[10px] font-mono animate-in zoom-in-95">{success}</div>
      )}
    </div>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const { user } = useSovereignStore();
  const { operatives, loading: listLoading, refetch: refetchLedger } = useOperativeLedger();

  if (!user || user.role !== AdminRole.SUPER_KING) return null;

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-32 text-left">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-100 pb-16">
        <div className="flex items-center gap-10">
          <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
            <Shield size={48} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-none">Architect Hub</h1>
            <div className="flex items-center gap-4 mt-5">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                <Globe size={14} className="text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest italic">Global Node Authority</span>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] italic">Ceremony Analytics v39.0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-12 gap-16">
        <div className="xl:col-span-4 space-y-12">
          <GlobalTelemetryMonitor />
          <SectorLockdown />
          <KillSwitchProtocol />
          <AdminProvisioning />
        </div>

        <div className="xl:col-span-8">
          <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col h-full min-h-[700px]">
            <div className="p-12 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <Users size={28} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-slate-900 tracking-tight">Personnel Ledger</h3>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic mt-1">Sovereign Identity Core</p>
                </div>
              </div>
              <button
                onClick={() => refetchLedger()}
                disabled={listLoading}
                className="p-5 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw size={28} className={listLoading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-10">
                  <tr>
                    <th className="p-8 text-[11px] font-black uppercase text-slate-400 italic tracking-[0.3em] border-b border-slate-100">Operative Profile</th>
                    <th className="p-8 text-[11px] font-black uppercase text-slate-400 italic tracking-[0.3em] border-b border-slate-100">Clearance</th>
                    <th className="p-8 text-[11px] font-black uppercase text-slate-400 italic tracking-[0.3em] border-b border-slate-100 text-right">Sector Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {operatives.length === 0 && !listLoading ? (
                    <tr>
                      <td colSpan={3} className="p-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-20">
                          <Database size={64} />
                          <span className="text-sm font-black uppercase italic tracking-widest leading-loose">No identities detected in sector database</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    operatives.map(op => (
                      <tr key={op.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-8">
                          <div className="flex items-center gap-6">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl border border-white group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                              {op.full_name?.charAt(0) || 'O'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 uppercase italic text-base tracking-tight">{op.full_name || 'ANONYMOUS'}</span>
                              <span className="text-[11px] text-slate-400 font-mono mt-1 lowercase opacity-60">{op.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic border ${op.role === 'super_king' ? 'bg-indigo-900 text-white border-indigo-900' :
                              op.role === 'sub_admin' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                'bg-slate-50 text-slate-500 border-slate-200'
                            }`}>
                            {op.role?.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-8 text-right">
                          <span className="font-black text-slate-900 italic text-sm uppercase tracking-[0.2em]">{op.school_arm}</span>
                        </td>
                      </tr>
                    ))
                  )}
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
