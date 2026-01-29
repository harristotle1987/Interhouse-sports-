import React from 'react';
import { Gift, AlertCircle, CheckCircle2 } from 'lucide-react';

interface GiveFreelyProps {
  payload?: {
    data?: any;
    status?: string;
  };
}

/**
 * SOVEREIGN RESOURCE DISTRIBUTION ENGINE [V9.4 - HARDENED GUARD]
 * Fixed: TypeError: Cannot read properties of undefined (reading 'payload')
 * Hardened against telemetry burst failures and missing packet headers.
 */
const GiveFreely: React.FC<GiveFreelyProps> = (props) => {
  // Deep guard for the entire props object and its payload property
  const safePayload = props?.payload || { data: null, status: 'AWAITING_UPLINK' };
  
  if (!safePayload || !safePayload.data) {
    return (
      <div className="p-8 bg-zinc-950 border border-zinc-900 rounded-[2rem] flex items-center gap-4 text-zinc-500 italic animate-pulse">
        <AlertCircle size={20} />
        <span className="text-[10px] font-black uppercase tracking-widest">Awaiting Valid Telemetry Payload...</span>
      </div>
    );
  }

  const data = safePayload.data;

  return (
    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
          <Gift size={24} />
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Resource Distribution</h3>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic mt-2">Status: {safePayload.status || 'STAGING'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {Array.isArray(data) ? data.map((item, i) => (
          <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item?.name || 'Anonymous Package'}</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
        )) : (
          <div className="p-6 bg-slate-900 text-white rounded-2xl font-mono text-xs overflow-x-auto">
            {JSON.stringify(data, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
};

export default GiveFreely;
