import React, { useState } from 'react';
import { Plus, School, Activity, Info, ShieldCheck, Loader2, Target } from 'lucide-react';
import { SchoolArm, EventType, AdminUser, AdminRole } from './types';
import { HOUSES } from './constants';

interface EventCreationFormProps {
  onEventCreated: (event: any) => void;
  admin: AdminUser;
}

const EventCreationForm: React.FC<EventCreationFormProps> = ({ onEventCreated, admin }) => {
  const [name, setName] = useState('');
  const [arm, setArm] = useState<SchoolArm>(admin.arm && admin.arm !== SchoolArm.GLOBAL ? admin.arm : SchoolArm.UPSS);
  const [type, setType] = useState<EventType>(EventType.SINGLE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter houses based on selected arm for precise telemetry
  const currentHouses = HOUSES.filter(h => h.arm === arm);
  
  const [houseScores, setHouseScores] = useState<Record<string, number>>({});

  const isArchitect = admin.role === AdminRole.SUPER_KING;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Package telemetry payload
    const newEvent = {
      id: `e-${Date.now()}`,
      name: name.toUpperCase(),
      arm,
      type,
      status: 'COMPLETED',
      recordedBy: admin.id || 'admin08',
      timestamp: Date.now(),
      scores: houseScores
    };

    // Simulate high-speed bunker uplink
    setTimeout(() => {
      onEventCreated(newEvent);
      setName('');
      setHouseScores({});
      setIsSubmitting(false);
    }, 1200);
  };

  const handleScoreChange = (houseId: string, val: string) => {
    const points = parseInt(val) || 0;
    setHouseScores(prev => ({ ...prev, [houseId]: points }));
  };

  return (
    <div className="bg-[#000000] border border-zinc-800 p-8 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"></div>
      
      {/* Header Suite */}
      <div className="flex items-center gap-6 mb-12 border-b border-zinc-900 pb-10">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rotate-[-4deg] shadow-2xl group-hover:rotate-0 transition-transform">
          <Target size={36} className="text-emerald-500" />
        </div>
        <div>
          <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">Event Creation Suite</h3>
          <div className="flex items-center gap-3 mt-3">
            <ShieldCheck size={14} className="text-emerald-500/50" />
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.3em] italic">Telemetry Source: {admin.id || 'admin08'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Row 1: Designation & Node */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-1">Event Designation</label>
            <input 
              required
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-black border border-zinc-800 px-6 py-5 text-white font-black tracking-tight focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-900 text-xl uppercase italic shadow-inner"
              placeholder="e.g. 100M DASH FINAL"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-1">Sector Node</label>
            <div className="relative">
              <select 
                value={arm}
                onChange={e => setArm(e.target.value as SchoolArm)}
                disabled={!isArchitect}
                className="w-full bg-black border border-zinc-800 px-6 py-5 text-white font-black tracking-tight focus:outline-none focus:border-emerald-500 transition-all appearance-none cursor-pointer disabled:opacity-50 text-xl uppercase italic"
              >
                <option value={SchoolArm.UPSS}>UPSS_NODE</option>
                <option value={SchoolArm.CAM}>CAM_NODE</option>
                <option value={SchoolArm.CAGS}>CAGS_NODE</option>
              </select>
              <School className="absolute right-6 top-6 text-zinc-800 pointer-events-none" size={24} />
            </div>
          </div>
        </div>

        {/* Row 2: Category Toggle */}
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-1">Telemetry Category</label>
          <div className="grid grid-cols-2 gap-6">
            {[EventType.SINGLE, EventType.GROUP].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setType(cat)}
                className={`py-6 border font-black uppercase italic text-sm tracking-[0.3em] transition-all ${
                  type === cat 
                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_40px_rgba(16,185,129,0.2)]' 
                  : 'bg-black border-zinc-800 text-zinc-600 hover:border-zinc-500 hover:text-white'
                }`}
              >
                {cat}_PROTOCOL
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: House Inputs */}
        <div className="space-y-8 pt-8 border-t border-zinc-900">
           <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 block ml-1 italic">Point Allocation Hub</label>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {currentHouses.map(house => (
                <div key={house.id} className="flex items-center gap-8 p-8 bg-[#050505] border border-zinc-800 group hover:border-zinc-600 transition-all relative">
                  <div 
                    className="w-16 h-16 flex items-center justify-center font-black text-2xl italic shrink-0 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/5" 
                    style={{ backgroundColor: house.color, color: house.color === '#FFFFFF' ? '#000' : '#FFF' }}
                  >
                    {house.name[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-black uppercase text-zinc-600 mb-3 tracking-widest">{house.name}</p>
                    <div className="relative">
                      <input 
                        type="number"
                        value={houseScores[house.id] || ''}
                        onChange={(e) => handleScoreChange(house.id, e.target.value)}
                        className="w-full bg-transparent border-b-2 border-zinc-800 focus:border-emerald-500 transition-all text-white font-black text-3xl focus:outline-none py-2 placeholder:text-zinc-900"
                        placeholder="00"
                      />
                      <span className="absolute right-0 bottom-2 text-[10px] font-mono text-zinc-800 uppercase">PTS</span>
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        {/* Footer Audit Note */}
        <div className="p-8 border border-zinc-900 bg-[#020202] flex items-start gap-8 shadow-inner relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/10 group-hover:bg-emerald-500 transition-all"></div>
          <Info className="text-zinc-800 shrink-0 mt-1" size={28} />
          <p className="text-[12px] font-mono text-zinc-700 uppercase italic leading-relaxed tracking-tight">
            Security Protocol Active. Sub-Admin ID {admin.id || 'admin08'} will be tagged to this telemetry packet. Score commitment is permanent and will trigger real-time Nexus updates.
          </p>
        </div>

        {/* Submit Node */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-10 bg-zinc-900 border border-zinc-800 text-white font-black uppercase italic tracking-[0.8em] hover:bg-emerald-600 hover:text-black hover:border-emerald-500 transition-all flex items-center justify-center gap-8 group disabled:opacity-20 shadow-[0_30px_60px_rgba(0,0,0,1)] active:scale-[0.98]"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-4">
               <Loader2 className="animate-spin" size={32} />
               <span className="text-xl">UPLINKING...</span>
            </div>
          ) : (
            <>
              <Activity size={32} className="group-hover:animate-pulse" />
              <span className="text-2xl">Initialize Telemetry Push</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default EventCreationForm;