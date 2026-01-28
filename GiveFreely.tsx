import React from 'react';
import { Gift, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GiveFreelyProps {
  payload?: {
    data?: any;
    status?: string;
  };
}

<<<<<<< HEAD
/**
 * SOVEREIGN DATA DISTRIBUTOR: GIVEFREELY [V1.0]
 * Fix: Implements exhaustive null-safety to prevent 'reading payload' TypeErrors.
 */
const GiveFreely: React.FC<GiveFreelyProps> = ({ payload }) => {
  // 1. Strict Payload Validation
=======
const GiveFreely: React.FC<GiveFreelyProps> = ({ payload }) => {
>>>>>>> 3646b0d (System-Wide Restoration: Fixed Auth Instances, Zustand, and Super Admin CRUD)
  if (!payload || !payload.data) {
    return (
      <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex items-center gap-4 text-zinc-500 italic">
        <AlertCircle size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Valid Telemetry Payload...</span>
      </div>
    );
  }

<<<<<<< HEAD
  // 2. Safe Data Extraction
  const data = payload?.data;
=======
  const data = payload.data;
>>>>>>> 3646b0d (System-Wide Restoration: Fixed Auth Instances, Zustand, and Super Admin CRUD)

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Gift size={24} />
        </div>
        <div>
<<<<<<< HEAD
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">Resource Distribution</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-1">Status: {payload?.status || 'UNKNOWN'}</p>
=======
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Resource Distribution</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Status: {payload.status || 'STAGING'}</p>
>>>>>>> 3646b0d (System-Wide Restoration: Fixed Auth Instances, Zustand, and Super Admin CRUD)
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(data) ? data.map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
<<<<<<< HEAD
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.name || 'Anonymous Package'}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        )) : (
          <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-xs">
=======
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item?.name || 'Anonymous Package'}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        )) : (
          <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-xs overflow-x-auto">
>>>>>>> 3646b0d (System-Wide Restoration: Fixed Auth Instances, Zustand, and Super Admin CRUD)
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};

<<<<<<< HEAD
export default GiveFreely;
=======
export default GiveFreely;
>>>>>>> 3646b0d (System-Wide Restoration: Fixed Auth Instances, Zustand, and Super Admin CRUD)
