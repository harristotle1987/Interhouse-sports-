
import React, { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { useSovereignStore } from './store';
import { 
  Zap, 
  Send, 
  Trophy, 
  AlertCircle, 
  Loader2, 
  Fingerprint, 
  Lock,
  ChevronDown,
  LayoutGrid,
  Edit3,
  CheckCircle2,
  Save,
  Activity
} from 'lucide-react';
import { SchoolArm, MatchType } from './types';

/**
 * ==========================================================
 * SOVEREIGN TACTICAL MATRIX: SECURE TACTICAL UPLINK [V30.0]
 * ==========================================================
 * Hardened for manual score overrides and dynamic classification.
 */
const DirectMatrix: React.FC = () => {
  const { user } = useSovereignStore();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectorArm = user?.arm;
  
  if (!sectorArm) {
    throw new Error("PROTOCOL_VIOLATION: NO SECTOR ASSIGNED TO OPERATIVE SESSION");
  }

  const fetchSectorMatches = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('matches')
        .select('*')
        .eq('school_arm', sectorArm)
        .eq('status', 'live')
        .order('created_at', { ascending: true });
      
      if (fetchError) throw fetchError;
      setMatches(data || []);
    } catch (err: any) {
      setError(err.message?.toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectorMatches();
    const poller = setInterval(fetchSectorMatches, 10000);
    return () => clearInterval(poller);
  }, [sectorArm]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-32 bg-zinc-950 border border-zinc-900 rounded-[3rem] animate-pulse">
      <Loader2 className="animate-spin text-emerald-500 mb-6" size={48} />
      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 italic">Accessing Sector Node...</span>
    </div>
  );

  return (
    <div className="bg-black text-white p-6 md:p-12 min-h-[600px] font-sans selection:bg-emerald-500/30 selection:text-emerald-500">
      <div className="max-w-6xl mx-auto space-y-12">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b border-zinc-900 pb-12">
          <div className="flex items-center gap-6 text-left">
            <div className="p-6 bg-zinc-900 border border-zinc-800 text-emerald-500 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)]">
              <Activity size={40} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Tactical Matrix</h2>
              <div className="flex items-center gap-3 mt-4">
                <Lock size={12} className="text-zinc-700" />
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic leading-none">
                  Sector Node: <span className="text-emerald-500">{sectorArm}</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="px-6 py-3 bg-zinc-950 border border-zinc-800 rounded-full flex items-center gap-3">
              <Fingerprint size={16} className="text-zinc-600" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Manual Override Authorized</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase italic tracking-widest animate-in slide-in-from-top-4">
            <AlertCircle size={24} /> {error}
          </div>
        )}

        <div className="grid gap-16">
          {matches.length === 0 ? (
            <div className="py-48 text-center border-2 border-dashed border-zinc-900 rounded-[4rem] flex flex-col items-center justify-center gap-8 group">
              <Trophy size={80} className="text-zinc-900 group-hover:text-zinc-800 transition-colors" />
              <p className="text-sm font-black uppercase tracking-[0.4em] italic text-zinc-700 group-hover:text-zinc-600">Zero Live Encounters Detected</p>
            </div>
          ) : (
            matches.map(match => (
              <TacticalEntryRow 
                key={match.id} 
                match={match} 
                sectorArm={sectorArm}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TacticalEntryRow: React.FC<{ match: any, sectorArm: string }> = ({ match, sectorArm }) => {
  const [scoreA, setScoreA] = useState<string>(match.score_a.toString());
  const [scoreB, setScoreB] = useState<string>(match.score_b.toString());
  const [matchType, setMatchType] = useState<MatchType>(match.match_type as MatchType);
  const [submitting, setSubmitting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Only update local state if not currently typing or submitting
    if (!submitting && !finalizing) {
      setScoreA(match.score_a.toString());
      setScoreB(match.score_b.toString());
      setMatchType(match.match_type as MatchType);
    }
  }, [match.score_a, match.score_b, match.match_type]);

  const getLabels = (type: MatchType) => {
    switch (type) {
      case MatchType.Track: return { a: 'LANE 1', b: 'LANE 2' };
      case MatchType.Field: return { a: 'COMPETITOR 1', b: 'COMPETITOR 2' };
      case MatchType.Single: return { a: 'ATHLETE A', b: 'ATHLETE B' };
      case MatchType.Team: default: return { a: 'HOUSE A', b: 'HOUSE B' };
    }
  };

  const labels = getLabels(matchType);

  const handleUpdate = async (isFinal: boolean = false) => {
    setLocalError(null);
    setSuccess(false);

    // CRITICAL VALIDATION GATE
    const numA = parseInt(scoreA);
    const numB = parseInt(scoreB);

    if (isNaN(numA) || isNaN(numB) || !/^\d+$/.test(scoreA.trim()) || !/^\d+$/.test(scoreB.trim())) {
      setLocalError("DATA_INTEGRITY_FAULT: NUMERIC_VALUE_REQUIRED");
      return;
    }

    if (isFinal) setFinalizing(true);
    else setSubmitting(true);

    try {
      const updates = {
        score_a: numA,
        score_b: numB,
        match_type: matchType,
        status: isFinal ? 'finished' : 'live'
      };

      const { error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', match.id)
        .eq('school_arm', sectorArm);

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      
      if (isFinal) {
        window.location.reload(); 
      }
    } catch (err: any) {
      setLocalError(`HANDSHAKE_FAULT: ${err.message.toUpperCase()}`);
    } finally {
      setSubmitting(false);
      setFinalizing(false);
    }
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-900 p-12 rounded-[3.5rem] shadow-2xl hover:border-zinc-800 transition-all group relative overflow-hidden text-left ${localError ? 'animate-shake' : ''}`}>
      <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-700 ${success ? 'bg-emerald-500 shadow-[0_0_20px_#10b981]' : 'bg-zinc-800'}`}></div>
      
      {/* Classification Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mb-16 pb-10 border-b border-zinc-900">
        <div className="flex flex-col gap-2">
           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em] italic">Telemetry Classification</span>
           <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{match.event_name}</h3>
        </div>
        
        <div className="relative group/select">
          <LayoutGrid size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/select:text-emerald-500 transition-colors" />
          <select 
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as MatchType)}
            className="bg-zinc-900 border border-zinc-800 pl-16 pr-12 py-5 text-xs font-black uppercase tracking-widest text-white rounded-2xl appearance-none focus:outline-none focus:border-emerald-500 transition-all cursor-pointer shadow-inner"
          >
            <option value={MatchType.Team}>TEAM_PROTOCOL</option>
            <option value={MatchType.Track}>TRACK_PROTOCOL</option>
            <option value={MatchType.Field}>FIELD_PROTOCOL</option>
            <option value={MatchType.Single}>SINGLE_PROTOCOL</option>
          </select>
          <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none" />
        </div>
      </div>

      {/* Manual Input Overrides */}
      <div className="grid md:grid-cols-2 gap-16 mb-16 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-black text-zinc-900 italic tracking-tighter opacity-20 hidden md:block">VS</div>
        
        <div className="space-y-6">
           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic text-center block w-full">
             {labels.a} <span className="text-zinc-700">({match.house_a || 'ALPHA'})</span>
           </label>
           <div className="relative group/input">
             <Edit3 size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within/input:text-emerald-500 transition-colors" />
             <input 
               type="text" 
               inputMode="numeric"
               value={scoreA}
               onChange={e => setScoreA(e.target.value)}
               className="w-full bg-black border border-zinc-900 p-12 rounded-[2.5rem] text-8xl font-black text-center text-white focus:outline-none focus:border-emerald-500 transition-all shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] tabular-nums italic"
               placeholder="0"
             />
           </div>
        </div>

        <div className="space-y-6">
           <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] italic text-center block w-full">
             {labels.b} <span className="text-zinc-700">({match.house_b || 'BETA'})</span>
           </label>
           <div className="relative group/input">
             <Edit3 size={24} className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-800 group-focus-within/input:text-emerald-500 transition-colors" />
             <input 
               type="text" 
               inputMode="numeric"
               value={scoreB}
               onChange={e => setScoreB(e.target.value)}
               className="w-full bg-black border border-zinc-900 p-12 rounded-[2.5rem] text-8xl font-black text-center text-white focus:outline-none focus:border-emerald-500 transition-all shadow-[inset_0_4px_30px_rgba(0,0,0,0.8)] tabular-nums italic"
               placeholder="0"
             />
           </div>
        </div>
      </div>

      {localError && (
        <div className="mb-10 p-6 bg-red-950/20 border border-red-900/40 rounded-2xl flex items-center gap-4 text-red-500 text-[10px] font-black uppercase italic tracking-widest animate-in slide-in-from-top-2">
          <AlertCircle size={20} /> {localError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        <button 
          disabled={submitting || finalizing}
          onClick={() => handleUpdate(false)}
          className="flex-1 py-8 bg-zinc-900 border border-zinc-800 text-white rounded-[2rem] font-black uppercase italic tracking-[0.5em] text-[10px] flex items-center justify-center gap-4 hover:bg-zinc-800 hover:border-zinc-600 transition-all active:scale-[0.98] disabled:opacity-20 group/btn"
        >
          {submitting ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              {success ? <CheckCircle2 size={20} className="text-emerald-500" /> : <Save size={20} className="text-emerald-500" />}
              Commit Correction
            </>
          )}
        </button>

        <button 
          disabled={submitting || finalizing}
          onClick={() => handleUpdate(true)}
          className="flex-1 py-8 bg-white text-black rounded-[2rem] font-black uppercase italic tracking-[0.5em] text-[10px] flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all active:scale-[0.98] disabled:opacity-20"
        >
          {finalizing ? <Loader2 size={20} className="animate-spin" /> : (
            <>
              <Send size={20} /> 
              Finish Encounter
            </>
          )}
        </button>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default DirectMatrix;
