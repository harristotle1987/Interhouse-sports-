
import React, { useState } from 'react';
import { 
  Loader2, 
  CheckCircle2, 
  Calendar,
  Zap,
  Tag,
  Clock,
  ShieldCheck,
  AlertCircle,
  WifiOff,
  FileText,
  ChevronDown,
  Layers,
  BarChart3
} from 'lucide-react';
import { SchoolArm, EventType, AdminUser, AdminRole, LiveMatch, MatchType, EventCategory, ScoringType } from './types';
import { supabase } from './supabase';
import { useTacticalData } from './hooks/useTacticalData';
import { useSovereignStore } from './store';

interface SubAdminEventFormProps {
  onEventCreated: (event: any) => void;
  admin: AdminUser;
}

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
  const [duration, setDuration] = useState(10);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    const payload = {
      school_arm: arm,
      event_name: name || 'Unclassified Deployment',
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
      const { error: liveError } = await supabase.from('matches').insert(payload);

      if (liveError) throw liveError;
      
      setStatus({ 
        type: 'success', 
        message: isFixture ? 'TACTICAL_FIXTURE: Scheduled successfully.' : 'TACTICAL_UPLINK: Matrix initialized.' 
      });

    } catch (err: any) {
      console.warn("UPLINK_FAIL: Switching to Local Persistence", err);
      // Constructing object for local store
      const localEvent: LiveMatch = {
        ...payload,
        id: `local-${Date.now()}`,
        match_type: MatchType.Team,
        duration_minutes: duration
      } as LiveMatch;
      addLocalEvent(localEvent);
      setStatus({ 
        type: 'offline', 
        message: 'UPLINK SEVERED. EVENT STORED IN LOCAL NEXUS.' 
      });
    } finally {
      setTimeout(() => {
        onEventCreated({ name, category, arm });
        setName('');
        setDescription('');
        setIsFixture(false);
        setStatus(null);
      }, 2000);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl max-w-3xl mx-auto relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
      
      <div className="flex items-center gap-5 mb-10 pb-8 border-b border-slate-50">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
          <Zap size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Provision Tactical Matrix</h3>
          <div className="flex items-center gap-2 mt-1">
             <ShieldCheck size={14} className="text-emerald-500" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Node: {arm} Sector</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="space-y-6">
          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Event Designation</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black text-xl rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-200 uppercase italic shadow-inner"
              placeholder="e.g. THE MIDNIGHT SPRINT"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Tactical Type</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value as EventCategory)}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-black rounded-2xl focus:outline-none appearance-none cursor-pointer uppercase italic text-sm"
                >
                  {Object.values(EventCategory).map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                </select>
                <Layers className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Scoring Logic</label>
              <div className="relative">
                <select 
                  value={scoringType}
                  onChange={e => setScoringType(e.target.value as ScoringType)}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-black rounded-2xl focus:outline-none appearance-none cursor-pointer uppercase italic text-sm"
                >
                  <option value={ScoringType.Single_Marks}>SINGLE (15/12/9/6)</option>
                  <option value={ScoringType.Group_Marks}>GROUP (25/20/15/10)</option>
                  <option value={ScoringType.Manual_Override}>MANUAL OVERRIDE</option>
                </select>
                <BarChart3 className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Tactical Description (Optional)</label>
            <div className="relative">
              <textarea 
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-medium text-sm rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300 italic shadow-inner resize-none"
                placeholder="Sector tactical drill details..."
              />
              <FileText className="absolute right-6 top-4 text-slate-200" size={18} />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setIsFixture(false)}
              className={`flex-1 py-5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic border transition-all ${!isFixture ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
            >
              Direct Matrix
            </button>
            <button
              type="button"
              onClick={() => setIsFixture(true)}
              className={`flex-1 py-5 px-6 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] italic border transition-all ${isFixture ? 'bg-amber-500 border-amber-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
            >
              Scheduled Feed
            </button>
          </div>

          {isFixture && (
            <div className="space-y-3 text-left animate-in slide-in-from-top-4 duration-500">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Kickoff Timestamp</label>
              <div className="relative">
                <input 
                  required
                  type="datetime-local" 
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-4 text-slate-900 font-black rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 shadow-inner italic uppercase text-sm"
                />
                <Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              </div>
            </div>
          )}
        </div>

        {status && (
          <div className={`p-6 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest italic animate-in zoom-in-95 duration-300 ${
            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
            status.type === 'offline' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
            'bg-red-50 text-red-700 border-red-100'
          }`}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : status.type === 'offline' ? <WifiOff size={20} /> : <AlertCircle size={20} />}
            {status.message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-7 bg-slate-900 text-white font-black uppercase italic tracking-[0.6em] rounded-[1.5rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : (isFixture ? 'Authorize Schedule' : 'Launch Live Matrix')}
        </button>
      </form>
    </div>
  );
};

export default SubAdminEventForm;