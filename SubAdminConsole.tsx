
import React, { useState, useEffect, useCallback } from 'react';
import { SchoolArm, AdminUser, LiveMatch, ScoreEntry, MatchType, EventType, ScoringType } from './types';
import SubAdminEventForm from './SubAdminEventForm';
import DirectMatrix from './DirectMatrix';
import ScheduledFeedController from './ScheduledFeedController';
import { supabase } from './supabase';
import { useTacticalData } from './hooks/useTacticalData';
import { useSovereignStore } from './store';
import { 
  Zap, 
  Activity, 
  Play, 
  Pause, 
  Target,
  Clock,
  Rocket,
  Shield,
  Terminal,
  Plus,
  Minus,
  Cpu,
  Loader2,
  CheckCircle2,
  UserCheck,
  Grid,
  Calendar,
  XCircle,
  AlertCircle,
  Users,
  UserPlus,
  Lock,
  Archive,
  Award,
  History,
  ArrowRight,
  Medal,
  ChevronDown,
  ShieldCheck,
  ZapOff
} from 'lucide-react';
import { HOUSES } from './constants';

const ResultLedgerModal: React.FC<{ 
  match: LiveMatch; 
  onClose: () => void; 
  onCommit: (results: { house_id: string, position: number }[], override?: { enabled: boolean, points: number, scoringLogic: ScoringType }) => void;
  loading: boolean;
}> = ({ match, onClose, onCommit, loading }) => {
  const [positions, setPositions] = useState<Record<number, string>>({
    1: '', 2: '', 3: '', 4: ''
  });
  const [currentScoring, setCurrentScoring] = useState<ScoringType>(match.scoring_logic || ScoringType.Single_Marks);
  const [manualPoints, setManualPoints] = useState(match.manual_score || 0);

  const sectorHouses = HOUSES.filter(h => h.arm === match.school_arm);
  const isOverride = currentScoring === ScoringType.Manual_Override;

  const handlePositionChange = (pos: number, houseId: string) => {
    setPositions(prev => ({ ...prev, [pos]: houseId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultPayload = Object.entries(positions)
      .filter(([_, houseId]) => houseId !== '')
      .map(([pos, houseId]) => ({
        house_id: houseId,
        position: parseInt(pos)
      }));
    
    if (resultPayload.length < 2) {
      alert("MINIMUM_TELEMETRY_REQUIRED: Assign at least 1st and 2nd place.");
      return;
    }
    
    onCommit(resultPayload, { enabled: isOverride, points: manualPoints, scoringLogic: currentScoring });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="bg-white rounded-[3rem] w-full max-w-2xl p-12 relative shadow-[0_40px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 text-left overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`absolute top-0 left-0 w-full h-2 ${isOverride ? 'bg-amber-500' : (currentScoring === ScoringType.Group_Marks ? 'bg-emerald-500' : 'bg-indigo-500')}`} />
        
        <div className="flex items-center justify-between mb-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 text-white rounded-2xl"><Medal size={24} /></div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Commit Result Ledger</h3>
              <div className="flex items-center gap-4 mt-1">
                <select 
                   value={currentScoring}
                   onChange={(e) => setCurrentScoring(e.target.value as ScoringType)}
                   className="bg-slate-100 border-none rounded-lg text-[10px] font-black uppercase px-2 py-1 focus:ring-0 cursor-pointer"
                >
                   <option value={ScoringType.Single_Marks}>SINGLE (15/12/9/6)</option>
                   <option value={ScoringType.Group_Marks}>GROUP (25/20/15/10)</option>
                   <option value={ScoringType.Manual_Override}>MANUAL OVERRIDE</option>
                </select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600 transition-colors"><XCircle size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 overflow-y-auto no-scrollbar pr-2">
           {isOverride && (
             <div className="p-6 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4 animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3">
                   <ZapOff size={18} className="text-amber-500" />
                   <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">Manual Point Override Protocol</span>
                </div>
                <div>
                   <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-2">Winner's Point Allocation</label>
                   <div className="relative">
                      <input 
                        type="number" 
                        value={manualPoints}
                        onChange={(e) => setManualPoints(parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Points for 1st place..."
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-amber-500 uppercase">PTS</span>
                   </div>
                </div>
             </div>
           )}

           {[1, 2, 3, 4].map(pos => (
             <div key={pos} className="flex items-center gap-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl font-black italic border border-slate-100 text-slate-900">
                  {pos}
                </div>
                <div className="flex-1 relative">
                  <select 
                    required={pos <= 2}
                    value={positions[pos]}
                    onChange={(e) => handlePositionChange(pos, e.target.value)}
                    className="w-full bg-transparent text-sm font-black uppercase italic tracking-widest focus:outline-none appearance-none cursor-pointer pr-10"
                  >
                    <option value="">SELECT HOUSE...</option>
                    {sectorHouses.map(h => (
                      <option key={h.id} value={h.id} disabled={Object.values(positions).includes(h.id) && positions[pos] !== h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={16} />
                </div>
                {!isOverride && (
                  <div className="text-right px-4">
                    <span className="text-[10px] font-black text-emerald-600 uppercase italic">
                      {currentScoring === ScoringType.Group_Marks ? [25, 20, 15, 10][pos-1] : [15, 12, 9, 6][pos-1]} PTS
                    </span>
                  </div>
                )}
             </div>
           ))}

           <div className="pt-6 border-t border-slate-100 flex items-center gap-4 shrink-0">
             <AlertCircle className="text-amber-500 shrink-0" size={18} />
             <p className="text-[10px] font-medium text-slate-400 uppercase italic leading-relaxed">
               COMMITMENT IS IMMUTABLE: Standings update instantly upon ledger seal.
             </p>
           </div>

           <button 
             type="submit" 
             disabled={loading}
             className="w-full py-6 bg-slate-900 text-white font-black uppercase italic tracking-[0.4em] rounded-[1.5rem] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] disabled:opacity-50 shrink-0"
           >
             {loading ? <Loader2 className="animate-spin" size={24} /> : (
               <>
                 <ShieldCheck size={20} /> Authorize Ledger Seal
               </>
             )}
           </button>
        </form>
      </div>
    </div>
  );
};

const LiveMatchController: React.FC<{ 
  match: LiveMatch; 
  admin: AdminUser; 
  onUpdate: (id: string, updates: Partial<LiveMatch>) => void; 
  onFinalize: (match: LiveMatch) => void 
}> = ({ match, admin, onUpdate, onFinalize }) => {
  const [isReady, setIsReady] = useState(false);
  const [uplinkError, setUplinkError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLedger, setShowLedger] = useState(false);

  useEffect(() => {
    if (match.status !== 'scheduled' || !match.kickoff_at) return;
    const check = () => {
      const kickoff = new Date(match.kickoff_at!).getTime();
      setIsReady(Date.now() >= kickoff);
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, [match.status, match.kickoff_at]);

  const incrementScore = async (houseId: string, amount: number) => {
    setUplinkError(null);
    setIsUpdating(true);
    
    let updates: any = {};
    if (match.house_a === houseId) {
      updates.score_a = Math.max(0, (match.score_a || 0) + amount);
    } else if (match.house_b === houseId) {
      updates.score_b = Math.max(0, (match.score_b || 0) + amount);
    } else {
      const currentScores = match.metadata?.scores || {};
      const newScore = Math.max(0, (currentScores[houseId] || 0) + amount);
      updates.metadata = {
        ...match.metadata,
        scores: { ...currentScores, [houseId]: newScore }
      };
    }

    try {
      const { error, count } = await supabase
        .from('matches')
        .update({ ...updates, version: match.version + 1 })
        .eq('id', match.id)
        .eq('version', match.version);

      if (error) throw error;
      if (count === 0) throw new Error("VERSION_CONFLICT");

      onUpdate(match.id, { ...updates, version: match.version + 1 });
    } catch (err: any) {
      if (err.message === "VERSION_CONFLICT") {
        setUplinkError("TELEMETRY_COLLISION: VERSION_OUTDATED");
      } else {
        setUplinkError("TRANSMISSION_FAILED: CHECK_VAULT_KEY");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const takeCommand = async () => {
    setUplinkError(null);
    const updates = {
      current_official_id: admin.id,
      current_official_name: admin.name,
      version: match.version + 1
    };

    try {
      const { error, count } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', match.id)
        .eq('version', match.version);

      if (error) throw error;
      if (count === 0) throw new Error("VERSION_CONFLICT");
      
      onUpdate(match.id, updates);
    } catch (err: any) {
      setUplinkError("HANDOVER_FAILED: VERSION_CONFLICT");
    }
  };

  const startMatch = async () => {
    setUplinkError(null);
    const now = new Date().toISOString();
    const updates: any = { 
      status: 'live', 
      started_at: now,
      created_at: now,
      current_official_id: admin.id,
      current_official_name: admin.name,
      version: match.version + 1
    };

    try {
      const { error, count } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', match.id)
        .eq('version', match.version);
      
      if (error) throw error;
      if (count === 0) throw new Error("VERSION_CONFLICT");
      onUpdate(match.id, updates);
    } catch (err) {
      setUplinkError("LAUNCH_FAILED: VERSION_CONFLICT");
    }
  };

  const toggleTimer = async () => {
    setUplinkError(null);
    const isNowPaused = match.status === 'live';
    const now = Date.now();
    
    let updates: any = { version: match.version + 1 };
    if (isNowPaused) {
      const elapsed = now - new Date(match.started_at || match.created_at!).getTime();
      updates.status = 'paused';
      updates.metadata = { ...match.metadata, elapsed_ms: elapsed };
    } else {
      const elapsed = match.metadata?.elapsed_ms || 0;
      const newStart = new Date(now - elapsed).toISOString();
      updates.status = 'live';
      updates.started_at = newStart;
      updates.created_at = newStart;
    }

    try {
      const { error, count } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', match.id)
        .eq('version', match.version);

      if (error) throw error;
      if (count === 0) throw new Error("VERSION_CONFLICT");
      onUpdate(match.id, updates);
    } catch (err) {
      setUplinkError("TIMER_SYNC_FAILED: VERSION_CONFLICT");
    }
  };

  const handleCancel = async () => {
    if (!confirm("ABORT PROTOCOL: Cancel this event permanently?")) return;
    try {
      const { error } = await supabase.from('matches').update({ status: 'cancelled' }).eq('id', match.id);
      if (error) throw error;
      onUpdate(match.id, { status: 'cancelled' });
    } catch (err) {
      setUplinkError("TRANSMISSION_FAILED: CHECK_VAULT_KEY");
    }
  };

  const handleCommitResults = async (results: { house_id: string, position: number }[], override?: { enabled: boolean, points: number, scoringLogic: ScoringType }) => {
    setIsUpdating(true);
    try {
      const { error: resultError } = await supabase
        .from('event_results')
        .insert(results.map(r => ({
          match_id: match.id,
          house_id: r.house_id,
          position: r.position
        })));
      
      if (resultError) throw resultError;

      const { error: sealError } = await supabase
        .from('matches')
        .update({ 
          status: 'finished',
          sealed_by: admin.id,
          sealed_at: new Date().toISOString(),
          winning_house_id: results.find(r => r.position === 1)?.house_id,
          scoring_logic: override?.scoringLogic || match.scoring_logic,
          manual_score: override?.points || 0,
          is_manual_override: override?.enabled || false,
          version: match.version + 1
        })
        .eq('id', match.id);
      
      if (sealError) throw sealError;

      onFinalize(match);
      setShowLedger(false);
    } catch (err: any) {
      setUplinkError(`COMMIT_FAULT: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const participants = match.metadata?.participants || [];
  const houseA = match.house_a ? HOUSES.find(h => h.id === match.house_a) : HOUSES.find(h => h.id === participants[0]);
  const houseB = match.house_b ? HOUSES.find(h => h.id === match.house_b) : HOUSES.find(h => h.id === participants[1]);

  const isPresiding = match.current_official_id === admin.id;

  if (match.status === 'scheduled') {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-500 transition-colors"></div>
        <div className="flex items-center gap-6">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${isReady ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
             <Clock size={32} />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-3 mb-1">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Event</span>
               {isReady && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide animate-pulse">Ready for Kickoff</span>}
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{match.event_name}</h4>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Start: {new Date(match.kickoff_at!).toLocaleString()}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-4">
            <button 
              onClick={handleCancel}
              className="p-3 text-slate-300 hover:text-red-500 transition-colors"
            >
              <XCircle size={20} />
            </button>
            <button 
              onClick={startMatch}
              className={`px-8 py-3 rounded-xl font-bold uppercase text-sm tracking-wider flex items-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100`}
            >
              <Rocket size={18} /> Launch Live Matrix
            </button>
          </div>
          {uplinkError && <span className="text-[9px] font-black text-red-500 uppercase animate-pulse">{uplinkError}</span>}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all relative ${match.status === 'live' ? 'border-emerald-100' : 'border-amber-100'}`}>
        <div className="p-10 border-b border-slate-100 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className={`p-4 rounded-2xl ${match.status === 'live' ? 'bg-emerald-50 text-emerald-600 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'bg-amber-50 text-amber-600'}`}>
              <Target className={match.status === 'live' ? 'animate-pulse' : ''} size={28} />
            </div>
            <div className="text-left">
               <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-[0.3em] italic ${match.status === 'live' ? 'text-emerald-600' : 'text-amber-600'}`}>
                     {match.status === 'live' ? '• Transmission Active' : '|| Local Hold'}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                  <div className="flex items-center gap-2">
                     <Users size={12} className="text-slate-400" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
                        Official: <span className={isPresiding ? 'text-indigo-600' : 'text-slate-600'}>{match.current_official_name || 'UNASSIGNED'}</span>
                     </span>
                  </div>
               </div>
               <h4 className="text-4xl font-black text-slate-900 tracking-tighter leading-none uppercase italic">{match.event_name}</h4>
               {uplinkError && (
                 <div className="mt-2 flex items-center gap-2 text-red-500 animate-pulse">
                    <AlertCircle size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{uplinkError}</span>
                 </div>
               )}
            </div>
          </div>
          <div className="flex gap-4">
            {!isPresiding && (
              <button 
                onClick={takeCommand}
                className="px-6 py-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-2xl transition-all flex items-center gap-3 font-black uppercase text-[10px] tracking-widest italic"
              >
                <UserPlus size={18} /> Take Command
              </button>
            )}
            <button 
              onClick={toggleTimer}
              disabled={!isPresiding}
              className={`px-8 py-4 flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all italic ${
                !isPresiding ? 'opacity-30 cursor-not-allowed bg-slate-100 text-slate-400' :
                match.status === 'live' 
                ? 'bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100'
              }`}
            >
              {match.status === 'live' ? <><Pause size={18} /> Pause Matrix</> : <><Play size={18} /> Resume Matrix</>}
            </button>
            <button 
              onClick={() => setShowLedger(true)}
              disabled={!isPresiding}
              className="px-8 py-4 bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-2xl font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl transition-all italic shadow-xl disabled:opacity-30 flex items-center gap-2"
            >
              <Award size={16} /> Seal Record
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/30">
          {[
            { house: houseA, score: match.house_a ? match.score_a : (match.metadata.scores?.[participants[0]] || 0) },
            { house: houseB, score: match.house_b ? match.score_b : (match.metadata.scores?.[participants[1]] || 0) }
          ].map((item, idx) => (
            item.house ? (
              <div key={item.house.id} className="p-16 flex flex-col items-center group relative">
                {(!isPresiding || isUpdating) && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    {isUpdating ? <Loader2 className="animate-spin text-indigo-500" size={32} /> : (
                      <div className="p-4 bg-slate-900/90 text-white rounded-2xl flex items-center gap-3 shadow-2xl">
                        <Lock size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest italic">Remote Control Locked</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex flex-col items-center gap-6 mb-12">
                  <div className="w-20 h-20 rounded-[2rem] shadow-2xl flex items-center justify-center text-white font-black text-3xl border-4 border-white transition-transform group-hover:scale-110" style={{ backgroundColor: item.house.color }}>
                    {item.house.name[0]}
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{item.house.name}</span>
                    <div className="text-[10rem] font-black text-slate-900 tabular-nums leading-none tracking-tighter mt-4 italic">
                      {item.score}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <button 
                      disabled={!isPresiding}
                      onClick={() => incrementScore(item.house!.id, -1)}
                      className="w-16 h-16 rounded-2xl border border-slate-200 text-slate-300 hover:bg-white hover:text-red-500 hover:border-red-100 flex items-center justify-center transition-all shadow-sm disabled:opacity-30"
                   >
                     <Minus size={24} />
                   </button>
                   <div className="flex gap-4">
                      {[1, 2, 3].map(val => (
                        <button 
                          key={val}
                          disabled={!isPresiding}
                          onClick={() => incrementScore(item.house!.id, val)}
                          className="w-20 h-20 rounded-3xl bg-white border border-slate-100 text-slate-900 font-black text-2xl italic hover:bg-indigo-600 hover:text-white hover:shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:-translate-y-2 transition-all active:scale-95 flex items-center justify-center shadow-sm disabled:opacity-30"
                        >
                          +{val}
                        </button>
                      ))}
                   </div>
                </div>
              </div>
            ) : (
               <div key={idx} className="p-20 flex flex-col items-center justify-center opacity-30">
                  <Shield size={48} className="text-slate-200 mb-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Sector Slot Empty</span>
               </div>
            )
          ))}
        </div>
      </div>

      {showLedger && (
        <ResultLedgerModal 
          match={match} 
          loading={isUpdating}
          onClose={() => setShowLedger(false)}
          onCommit={handleCommitResults}
        />
      )}
    </>
  );
};

const ArchiveFeed: React.FC<{ matches: LiveMatch[] }> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 flex flex-col items-center justify-center text-center">
        <div className="p-6 bg-slate-50 rounded-full mb-8"><Archive className="text-slate-200" size={64} /></div>
        <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Archive Empty</h3>
        <p className="text-slate-500 max-w-md mx-auto mt-4 text-sm font-medium uppercase tracking-widest leading-relaxed italic">No finalized telemetry records found in this sector.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      {matches.map(m => {
        const winner = HOUSES.find(h => h.id === m.winning_house_id);
        const houseAId = m.house_a || m.metadata?.participants?.[0];
        const houseBId = m.house_b || m.metadata?.participants?.[1];
        const houseA = HOUSES.find(h => h.id === houseAId);
        const houseB = HOUSES.find(h => h.id === houseBId);

        return (
          <div key={m.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row items-center justify-between gap-10 group relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-100 group-hover:bg-indigo-500 transition-colors"></div>
             
             <div className="flex items-center gap-8 flex-1">
                <div className={`p-5 rounded-2xl ${m.status === 'finished' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                   {m.status === 'finished' ? <Award size={32} /> : <XCircle size={32} />}
                </div>
                <div className="text-left">
                   <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Seal Sequence Complete</span>
                      {m.scoring_logic === ScoringType.Manual_Override && (
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest italic ml-2">• Manual Override Applied</span>
                      )}
                      <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 italic">Ref: {m.id.slice(0,8)}</span>
                   </div>
                   <h4 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{m.event_name}</h4>
                   <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
                         <UserCheck size={12} className="text-slate-400" />
                         <span className="text-[9px] font-black text-slate-600 uppercase italic">Director: {m.current_official_name || 'System Auto'}</span>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full">
                         <History size={12} className="text-slate-400" />
                         <span className="text-[9px] font-black text-slate-600 uppercase italic">Sealed: {m.sealed_at ? new Date(m.sealed_at).toLocaleString() : 'N/A'}</span>
                      </div>
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-12">
                <div className="flex items-center gap-6">
                   <div className="text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{houseA?.name.split(' ')[1]}</span>
                      <span className="text-4xl font-black text-slate-900 italic leading-none">{m.score_a}</span>
                   </div>
                   <div className="text-[10px] font-black text-slate-200 italic">VS</div>
                   <div className="text-left">
                      <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">{houseB?.name.split(' ')[1]}</span>
                      <span className="text-4xl font-black text-slate-900 italic leading-none">{m.score_b}</span>
                   </div>
                </div>

                {winner && (
                  <div className="flex flex-col items-center gap-3 pl-12 border-l border-slate-100">
                     <div className="w-12 h-12 rounded-xl shadow-lg flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: winner.color }}>
                        {winner.name[0]}
                     </div>
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest italic">Victor</span>
                  </div>
                )}
             </div>
          </div>
        );
      })}
    </div>
  );
};

const SubAdminConsole: React.FC<{ admin: AdminUser; onEventCreated: (event: any) => void }> = ({ admin, onEventCreated }) => {
  const { arm } = useTacticalData();
  const { localEvents, updateLocalEvent, addLocalResult } = useSovereignStore();
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([]);
  const [archivedMatches, setArchivedMatches] = useState<LiveMatch[]>([]);
  const [view, setView] = useState<'create' | 'control' | 'matrix' | 'schedule' | 'archive'>('matrix');
  const [loading, setLoading] = useState(false);

  const fetchMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select('*')
        .eq('school_arm', arm);
      
      if (error) throw error;
      if (data) {
        setActiveMatches(data.filter(m => ['live', 'paused', 'scheduled'].includes(m.status)));
        setArchivedMatches(data.filter(m => ['finished', 'cancelled'].includes(m.status)).sort((a, b) => 
          new Date(b.sealed_at || b.created_at!).getTime() - new Date(a.sealed_at || a.created_at!).getTime()
        ));
      }
    } catch (err) {
      console.warn("TACTICAL_FETCH_FAULT", err);
    }
  }, [arm]);

  useEffect(() => {
    fetchMatches();
    const channel = supabase
      .channel(`sector_theater_${arm}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'matches',
        filter: `school_arm=eq.${arm}` 
      }, () => {
        fetchMatches();
      })
      .subscribe();

    const poller = setInterval(fetchMatches, 10000);
    return () => {
      clearInterval(poller);
      supabase.removeChannel(channel);
    };
  }, [arm, fetchMatches]);

  const handleUpdate = async (id: string, updates: Partial<LiveMatch>) => {
    updateLocalEvent(id, updates);
    fetchMatches();
  };

  const handleFinalize = async (match: LiveMatch) => {
    fetchMatches();
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
      
      <div className="bg-slate-900 p-10 md:p-14 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10 border border-white/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="relative z-10 space-y-4 text-left">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50/20 border border-indigo-500/30 rounded-lg">
                 <Terminal size={20} className="text-indigo-400" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Sector Command Node</span>
           </div>
           
           <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
              SECTOR: <span className="text-indigo-400">{arm}</span> THEATER
           </h1>
           
           <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
              <UserCheck size={16} className="text-emerald-400" />
              <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                 DIRECTOR: <span className="text-white">{admin.name.toUpperCase()}</span>
              </span>
           </div>
        </div>

        <div className="relative z-10 flex flex-wrap p-2 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md self-start lg:self-center">
          <button onClick={() => setView('matrix')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic ${view === 'matrix' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Grid size={16} /> Matrix
          </button>
          <button onClick={() => setView('schedule')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic ${view === 'schedule' ? 'bg-amber-500 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Calendar size={16} /> Stage
          </button>
          <button onClick={() => setView('create')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all italic ${view === 'create' ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Provision</button>
          <button onClick={() => setView('control')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic ${view === 'control' ? 'bg-indigo-500 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Live Feed</button>
          <button onClick={() => setView('archive')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 italic ${view === 'archive' ? 'bg-emerald-600 text-white shadow-xl' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Archive</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {view === 'matrix' ? (
          <DirectMatrix />
        ) : view === 'schedule' ? (
          <ScheduledFeedController />
        ) : view === 'control' ? (
           activeMatches.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-32 flex flex-col items-center justify-center text-center">
                 <div className="p-6 bg-slate-50 rounded-full mb-8"><Shield className="text-slate-300" size={64} /></div>
                 <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">No Active Tactical Events</h3>
                 <p className="text-slate-500 max-w-md mx-auto mt-4 text-sm font-medium uppercase tracking-widest leading-relaxed italic">Initiate a telemetry provision to begin data capture.</p>
              </div>
           ) : (
              <div className="grid gap-12">{activeMatches.map(match => (
                <LiveMatchController 
                  key={match.id} 
                  match={match} 
                  admin={admin}
                  onUpdate={handleUpdate} 
                  onFinalize={handleFinalize} 
                />
              ))}</div>
           )
        ) : view === 'archive' ? (
           <ArchiveFeed matches={archivedMatches} />
        ) : (
          <SubAdminEventForm admin={admin} onEventCreated={onEventCreated} />
        )}
      </div>
    </div>
  );
};

export default SubAdminConsole;
