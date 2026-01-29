import React, { useState, useEffect, useCallback } from 'react';
import { SchoolArm, AdminUser, LiveMatch, MatchType, EventCategory, ScoringType } from './types';
import ObsidianNexusControl from './ObsidianNexusControl';
import DirectMatrix from './DirectMatrix';
import { supabase } from './supabase';
import { useTacticalData } from './hooks/useTacticalData';
import { useSovereignStore } from './store';
import { 
  Zap, 
  Terminal, 
  Grid, 
  Archive, 
  UserCheck, 
  Award, 
  XCircle, 
  Medal, 
  ShieldCheck, 
  Clock, 
  Rocket, 
  Target, 
  Pause, 
  Play, 
  UserPlus, 
  Lock, 
  Minus, 
  Loader2, 
  AlertCircle,
  History
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
    
    if (resultPayload.length < 1) {
      alert("MINIMUM_TELEMETRY_REQUIRED: Assign at least 1st place.");
      return;
    }
    
    onCommit(resultPayload, { enabled: isOverride, points: manualPoints, scoringLogic: currentScoring });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="bg-zinc-950 border border-zinc-800 rounded-[3rem] w-full max-w-2xl p-12 relative shadow-[0_40px_100px_rgba(0,0,0,1)] animate-in zoom-in-95 text-left overflow-hidden max-h-[90vh] flex flex-col">
        <div className={`absolute top-0 left-0 w-full h-2 ${isOverride ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        
        <div className="flex items-center justify-between mb-10 shrink-0">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-zinc-800"><Medal size={24} /></div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Commit Result Ledger</h3>
              <select 
                 value={currentScoring}
                 onChange={(e) => setCurrentScoring(e.target.value as ScoringType)}
                 className="bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-lg text-[10px] font-black uppercase px-2 py-1 mt-2 focus:ring-0 cursor-pointer"
              >
                 <option value={ScoringType.Single_Marks}>SINGLE (15/12/9/6)</option>
                 <option value={ScoringType.Group_Marks}>GROUP (25/20/15/10)</option>
                 <option value={ScoringType.Manual_Override}>MANUAL OVERRIDE</option>
              </select>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors"><XCircle size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto no-scrollbar pr-2">
           {[1, 2, 3, 4].map(pos => (
             <div key={pos} className="flex items-center gap-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:border-emerald-500/30 transition-all">
                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-xl font-black italic border border-zinc-800 text-white">
                  {pos}
                </div>
                <div className="flex-1 relative">
                  <select 
                    required={pos === 1}
                    value={positions[pos]}
                    onChange={(e) => handlePositionChange(pos, e.target.value)}
                    className="w-full bg-transparent text-sm font-black text-white uppercase italic tracking-widest focus:outline-none appearance-none cursor-pointer"
                  >
                    <option value="" className="bg-black">SELECT HOUSE...</option>
                    {sectorHouses.map(h => (
                      <option key={h.id} value={h.id} disabled={Object.values(positions).includes(h.id) && positions[pos] !== h.id} className="bg-black">
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
             </div>
           ))}

           <button 
             type="submit" 
             disabled={loading}
             className="w-full py-6 bg-emerald-600 text-black font-black uppercase italic tracking-[0.4em] rounded-[1.5rem] hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4"
           >
             {loading ? <Loader2 className="animate-spin" size={24} /> : <><ShieldCheck size={20} /> Authorize Ledger Seal</>}
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [showLedger, setShowLedger] = useState(false);
  const [uplinkError, setUplinkError] = useState<string | null>(null);

  const incrementScore = async (houseId: string, amount: number) => {
    setUplinkError(null);
    setIsUpdating(true);
    let updates: any = {};
    if (match.house_a === houseId) updates.score_a = Math.max(0, (match.score_a || 0) + amount);
    else if (match.house_b === houseId) updates.score_b = Math.max(0, (match.score_b || 0) + amount);
    else {
      const currentScores = match.metadata?.scores || {};
      updates.metadata = { ...match.metadata, scores: { ...currentScores, [houseId]: Math.max(0, (currentScores[houseId] || 0) + amount) } };
    }

    try {
      const { error } = await supabase.from('matches').update({ ...updates, version: match.version + 1 }).eq('id', match.id);
      if (error) throw error;
      onUpdate(match.id, { ...updates, version: match.version + 1 });
    } catch (err: any) {
      setUplinkError("TRANSMISSION_FAILED");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCommitResults = async (results: { house_id: string, position: number }[], override?: { enabled: boolean, points: number, scoringLogic: ScoringType }) => {
    setIsUpdating(true);
    try {
      await supabase.from('event_results').insert(results.map(r => ({ match_id: match.id, house_id: r.house_id, position: r.position })));
      await supabase.from('matches').update({ 
        status: 'finished', sealed_by: admin.id, sealed_at: new Date().toISOString(),
        winning_house_id: results.find(r => r.position === 1)?.house_id, version: match.version + 1 
      }).eq('id', match.id);
      onFinalize(match);
      setShowLedger(false);
    } catch (err: any) {
      setUplinkError(`COMMIT_FAULT`);
    } finally {
      setIsUpdating(false);
    }
  };

  const participants = match.metadata?.participants || [];
  const houseA = match.house_a ? HOUSES.find(h => h.id === match.house_a) : HOUSES.find(h => h.id === participants[0]);
  const houseB = match.house_b ? HOUSES.find(h => h.id === match.house_b) : HOUSES.find(h => h.id === participants[1]);

  return (
    <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 shadow-2xl overflow-hidden relative mb-12">
      <div className="p-10 border-b border-zinc-900 flex justify-between items-center text-left">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl"><Target size={28} /></div>
          <div>
            <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter">{match.event_name}</h4>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 animate-pulse mt-1 block italic">• Transmission Live</span>
          </div>
        </div>
        <button onClick={() => setShowLedger(true)} className="px-8 py-4 bg-emerald-600 text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-emerald-500 transition-all italic">Seal Record</button>
      </div>

      <div className="grid md:grid-cols-2 divide-x divide-zinc-900 bg-black/40">
        {[
          { house: houseA, score: match.house_a ? match.score_a : (match.metadata.scores?.[participants[0]] || 0) },
          { house: houseB, score: match.house_b ? match.score_b : (match.metadata.scores?.[participants[1]] || 0) }
        ].map((item, idx) => (
          <div key={idx} className="p-16 flex flex-col items-center group relative">
            <div className="w-20 h-20 rounded-[1.5rem] shadow-2xl flex items-center justify-center text-white font-black text-3xl border border-white/5 mb-8" style={{ backgroundColor: item.house?.color || '#333' }}>
              {item.house?.name[0] || '?'}
            </div>
            <div className="text-[10rem] font-black text-white tabular-nums leading-none tracking-tighter italic">{item.score}</div>
            <div className="flex gap-4 mt-12">
              <button onClick={() => incrementScore(item.house!.id, -1)} className="w-16 h-16 rounded-2xl border border-zinc-800 text-zinc-600 hover:text-red-500 flex items-center justify-center transition-all"><Minus size={24} /></button>
              <button onClick={() => incrementScore(item.house!.id, 1)} className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-black text-2xl hover:bg-emerald-600 hover:text-black transition-all">+1</button>
            </div>
          </div>
        ))}
      </div>
      {showLedger && <ResultLedgerModal match={match} loading={isUpdating} onClose={() => setShowLedger(false)} onCommit={handleCommitResults} />}
    </div>
  );
};

const SubAdminConsole: React.FC<{ admin: AdminUser; onEventCreated: (event: any) => void }> = ({ admin, onEventCreated }) => {
  const { arm } = useTacticalData();
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([]);
  const [archivedMatches, setArchivedMatches] = useState<LiveMatch[]>([]);
  const [view, setView] = useState<'nexus' | 'control' | 'archive'>('nexus');

  const fetchMatches = useCallback(async () => {
    const { data } = await supabase.from('matches').select('*').eq('school_arm', arm);
    if (data) {
      setActiveMatches(data.filter(m => ['live', 'paused', 'scheduled'].includes(m.status)));
      setArchivedMatches(data.filter(m => ['finished', 'cancelled'].includes(m.status)).sort((a,b) => new Date(b.sealed_at || 0).getTime() - new Date(a.sealed_at || 0).getTime()));
    }
  }, [arm]);

  useEffect(() => {
    fetchMatches();
    const poller = setInterval(fetchMatches, 10000);
    return () => clearInterval(poller);
  }, [fetchMatches]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <div className="bg-black p-12 rounded-[4rem] border border-zinc-900 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="text-left relative z-10">
          <div className="flex items-center gap-3 mb-4">
             <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500"><Terminal size={20} /></div>
             <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-500 italic">Sector Node: {arm}</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white uppercase italic tracking-tighter leading-none">OBSIDIAN<span className="text-zinc-800">.NEXUS</span></h1>
        </div>

        <div className="relative z-10 flex p-2 bg-zinc-900/50 border border-zinc-800 rounded-[2rem] backdrop-blur-md">
          <button onClick={() => setView('nexus')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${view === 'nexus' ? 'bg-white text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Nexus Control</button>
          <button onClick={() => setView('control')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${view === 'control' ? 'bg-emerald-600 text-black shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Live Telemetry</button>
          <button onClick={() => setView('archive')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${view === 'archive' ? 'bg-zinc-800 text-white shadow-xl' : 'text-zinc-500 hover:text-white'}`}>Archive</button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {view === 'nexus' ? <ObsidianNexusControl admin={admin} onEventCreated={fetchMatches} /> : 
         view === 'control' ? (activeMatches.length === 0 ? <div className="py-40 text-center opacity-20 uppercase font-black italic text-sm tracking-widest">No Active Streams</div> : activeMatches.map(m => <LiveMatchController key={m.id} match={m} admin={admin} onUpdate={fetchMatches} onFinalize={fetchMatches} />)) :
         <div className="grid gap-6">
           {archivedMatches.map(m => (
             <div key={m.id} className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2.5rem] flex items-center justify-between text-left group hover:border-zinc-700 transition-all">
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-2xl"><Archive size={24} /></div>
                 <div>
                   <h4 className="text-xl font-black text-white uppercase italic">{m.event_name}</h4>
                   <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">Sealed: {m.sealed_at ? new Date(m.sealed_at).toLocaleDateString() : 'Historical'}</span>
                 </div>
               </div>
               <div className="text-right">
                 <span className="text-3xl font-black text-white tabular-nums italic">{m.score_a} - {m.score_b}</span>
               </div>
             </div>
           ))}
         </div>
        }
      </div>
    </div>
  );
};

export default SubAdminConsole;