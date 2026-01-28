import React, { useState } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  Calendar,
  Zap,
  ShieldCheck,
  AlertCircle,
  WifiOff,
  Layers,
  BarChart3
} from 'lucide-react';
import { SchoolArm, AdminUser, LiveMatch, MatchType, EventCategory, ScoringType } from './types';
import { SovereignAPI } from './lib/api';
import { useTacticalData } from './hooks/useTacticalData';
import { useSovereignStore } from './store';

interface SubAdminEventFormProps {
  onEventCreated: (event: any) => void;
  admin: AdminUser;
}

/**
 * SOVEREIGN PROVISION MATRIX [V7.0 - ANTI-ABORT]
 * Fix: Removed all AbortController logic to stop "SIGNAL IS ABORTED" crashes.
 */
const SubAdminEventForm: React.FC<SubAdminEventFormProps> = ({ onEventCreated, admin }) => {
  const { arm } = useTacticalData();
  const { addLocalEvent } = useSovereignStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventCategory>(EventCategory.Track);
  const [scoringType, setScoringType] = useState<ScoringType>(ScoringType.Single_Marks);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'offline', message: string } | null>(null);

  const [isFixture, setIsFixture] = useState(false);
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().slice(0, 16));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    // 21 Biennial Event Telemetry Packet
    const payload: Partial<LiveMatch> = {
      school_arm: arm,
      event_name: name.toUpperCase() || 'UNCLASSIFIED_NODE',
      description: description,
      status: (isFixture ? 'scheduled' : 'live') as LiveMatch['status'],
      event_type: category,
      scoring_logic: scoringType,
      kickoff_at: isFixture ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
      match_type: MatchType.Team, 
      version: 1,
      score_a: 0,
      score_b: 0,
      metadata: {
        scores: {},
        participants: []
      }
    };

    try {
      // Direct execution without AbortController
      const result = await SovereignAPI.createEventGlobal(payload);

      if (!result) throw new Error("VAULT_ACK_TIMEOUT");
      
      setStatus({ 
        type: 'success', 
        message: 'ESTABLISHED: Global Matrix synchronized.' 
      });

      setTimeout(() => {
        onEventCreated(result);
        setName('');
        setDescription('');
        setIsFixture(false);
        setStatus(null);
      }, 1500);

    } catch (err: any) {
      console.warn("UPLINK_INTERRUPTED: Defaulting to local buffer", err);
      const localEvent: LiveMatch = {
        ...payload,
        id: `local-${Date.now()}`,
        duration_minutes: 15
      } as LiveMatch;
      addLocalEvent(localEvent);
      setStatus({ 
        type: 'offline', 
        message: 'LOCAL_BUFFER_ACTIVE: Record saved locally.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl max-w-3xl mx-auto relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
      
      <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-50 text-left">
        <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.25rem]">
          <Zap size={28} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Matrix Provision</h3>
          <div className="flex items-center gap-2 mt-2">
             <ShieldCheck size={14} className="text-emerald-500" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Node: {arm}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-8">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Event Designation</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-8 py-6 text-slate-900 font-black text-2xl rounded-3xl focus:outline-none focus:border-indigo-600 transition-all uppercase italic shadow-inner"
              placeholder="e.g. 100M DASH"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Tactical Node</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none appearance-none cursor-pointer uppercase italic text-sm"
                >
                  {Object.values(EventCategory).map(cat => <option key={cat} value={cat}>{cat.replace('_', ' ').toUpperCase()}</option>)}
                </select>
                <Layers className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
              </div>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Logic Scale</label>
              <div className="relative">
                <select 
                  value={scoringType}
                  onChange={e => setScoringType(e.target.value as ScoringType)}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none appearance-none cursor-pointer uppercase italic text-sm"
                >
                  <option value={ScoringType.Single_Marks}>SINGLE (15/12/9/6)</option>
                  <option value={ScoringType.Group_Marks}>GROUP (25/20/15/10)</option>
                  <option value={ScoringType.Manual_Override}>MANUAL OVERRIDE</option>
                </select>
                <BarChart3 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
              </div>
            </div>
          </div>
        </div>

        {status && (
          <div className={`p-8 rounded-[2rem] flex items-center gap-5 text-[11px] font-black uppercase tracking-widest italic animate-in zoom-in-95 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
            status.type === 'offline' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
            'bg-red-50 text-red-700 border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={24} /> : status.type === 'offline' ? <WifiOff size={24} /> : <AlertCircle size={24} />}
            {status.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-9 bg-slate-900 text-white font-black uppercase italic tracking-[0.7em] rounded-[2rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-[0.98] disabled:opacity-50 text-lg"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={28} /> : 'Establish Matrix Uplink'}
        </button>
      </form>
    </div>
  );
};

export default SubAdminEventForm;