import React, { useState } from 'react';
import { 
  Plus, 
  Target, 
  ShieldCheck, 
  Loader2, 
  Activity, 
  Clock, 
  Zap, 
  ArrowRight,
  History,
  Info
} from 'lucide-react';
import { SchoolArm, AdminUser, LiveMatch, MatchType, EventCategory, ScoringType } from './types';
import { supabase } from './supabase';
import { HOUSES } from './constants';

/**
 * OBSIDIAN NEXUS CONTROL [V130.0]
 * High-contrast, unified stream for immediate and scheduled event provisioning.
 * All AbortControllers removed.
 */
const ObsidianNexusControl: React.FC<{ admin: AdminUser, onEventCreated: () => void }> = ({ admin, onEventCreated }) => {
  const [mode, setMode] = useState<'IMMEDIATE' | 'STAGED'>('IMMEDIATE');
  const [name, setName] = useState('');
  const [houseA, setHouseA] = useState('');
  const [houseB, setHouseB] = useState('');
  const [kickoff, setKickoff] = useState('');
  const [category, setCategory] = useState<EventCategory>(EventCategory.Track);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const sectorArm = admin.arm || SchoolArm.UPSS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    const payload: Partial<LiveMatch> = {
      school_arm: sectorArm,
      event_name: name.toUpperCase() || 'UNCLASSIFIED_TELEMETRY',
      status: mode === 'IMMEDIATE' ? 'live' : 'scheduled',
      event_type: category,
      scoring_logic: ScoringType.Single_Marks,
      kickoff_at: mode === 'STAGED' ? new Date(kickoff).toISOString() : new Date().toISOString(),
      match_type: MatchType.Team,
      house_a: houseA || null,
      house_b: houseB || null,
      score_a: 0,
      score_b: 0,
      metadata: { 
        scores: {}, 
        participants: [houseA, houseB].filter(Boolean) 
      },
      version: 1
    };

    try {
      const { error } = await supabase.from('matches').insert(payload);
      if (error) throw error;

      setStatus(`SUCCESS: Telemetry committed to ${mode} buffer.`);
      setTimeout(() => {
        onEventCreated();
        setName('');
        setHouseA('');
        setHouseB('');
        setKickoff('');
        setStatus(null);
      }, 1500);
    } catch (err: any) {
      setStatus(`ERROR: ${err.message.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-zinc-900 rounded-[3rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden animate-in fade-in slide-in-from-bottom-6 text-left">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 border-b border-zinc-900 pb-12">
        <div className="flex items-center gap-6">
          <div className="p-5 bg-zinc-900 border border-zinc-800 text-emerald-500 rounded-3xl"><Target size={36} /></div>
          <div>
            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Nexus Provisioning</h3>
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic mt-2">Authenticated Source: {admin.id.slice(0,12)}</p>
          </div>
        </div>

        <div className="flex p-1.5 bg-zinc-950 border border-zinc-900 rounded-2xl">
          <button onClick={() => setMode('IMMEDIATE')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all ${mode === 'IMMEDIATE' ? 'bg-emerald-600 text-black' : 'text-zinc-600 hover:text-white'}`}>Immediate Push</button>
          <button onClick={() => setMode('STAGED')} className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest italic transition-all ${mode === 'STAGED' ? 'bg-amber-500 text-black' : 'text-zinc-600 hover:text-white'}`}>Staged Sequence</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1 italic">Event Designation</label>
            <input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-black border border-zinc-900 p-6 text-white font-black text-xl rounded-2xl focus:outline-none focus:border-emerald-500 transition-all uppercase italic shadow-inner" placeholder="E.G. 100M FINALS" />
          </div>
          <div className="space-y-4">
             <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1 italic">Temporal Reference</label>
             {mode === 'IMMEDIATE' ? (
                <div className="w-full bg-zinc-900/30 border border-zinc-900 p-6 rounded-2xl flex items-center gap-4 text-zinc-500 italic uppercase font-black text-sm">
                   <Clock size={18} /> Instant Kickoff [T-00:00]
                </div>
             ) : (
                <input required type="datetime-local" value={kickoff} onChange={e => setKickoff(e.target.value)} className="w-full bg-black border border-zinc-900 p-6 text-white font-black rounded-2xl focus:outline-none focus:border-amber-500 transition-all italic text-sm" />
             )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1 italic">Combatant Alpha</label>
              <select value={houseA} onChange={e => setHouseA(e.target.value)} className="w-full bg-black border border-zinc-900 p-6 text-white font-black text-sm rounded-2xl focus:outline-none focus:border-emerald-500 appearance-none italic uppercase">
                 <option value="">SELECT HOUSE...</option>
                 {HOUSES.filter(h => h.arm === sectorArm).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 ml-1 italic">Combatant Beta</label>
              <select value={houseB} onChange={e => setHouseB(e.target.value)} className="w-full bg-black border border-zinc-900 p-6 text-white font-black text-sm rounded-2xl focus:outline-none focus:border-emerald-500 appearance-none italic uppercase">
                 <option value="">SELECT HOUSE...</option>
                 {HOUSES.filter(h => h.arm === sectorArm).map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </select>
           </div>
        </div>

        {status && (
          <div className={`p-6 border rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic animate-in zoom-in-95 ${status.includes('ERROR') ? 'bg-red-950/20 border-red-500/30 text-red-500' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-500'}`}>
            <Info size={18} /> {status}
          </div>
        )}

        <button type="submit" disabled={loading} className={`w-full py-8 text-black font-black uppercase italic tracking-[0.8em] rounded-[2.5rem] transition-all flex items-center justify-center gap-6 shadow-2xl active:scale-[0.98] disabled:opacity-30 text-lg ${mode === 'IMMEDIATE' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
          {loading ? <Loader2 className="animate-spin" size={32} /> : (
            <>
              {mode === 'IMMEDIATE' ? <Zap size={32} /> : <History size={32} />}
              Initialize Provisioning
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ObsidianNexusControl;