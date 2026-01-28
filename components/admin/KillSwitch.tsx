import React, { useState } from 'react';
import { supabase } from '../../supabase';
import { useSovereignStore } from '../../store';
import { AdminRole } from '../../types';
import { Biohazard, Loader2, ShieldAlert, RefreshCw } from 'lucide-react';

/**
 * ARCHITECT KILL-SWITCH [V8.0 - HARD REBOOT]
 * Purpose: Global data purge and forced HARD hardware reload.
 * Fix: Uses window.location.reload(true) to solve slow-loading state loops.
 */
const KillSwitch: React.FC = () => {
  const { user } = useSovereignStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');

  // Strict Clearance Gate: Architect Level Only
  if (user?.role !== AdminRole.SUPER_KING) return null;

  const handleSystemPurge = async () => {
    if (confirmation !== 'PURGE') {
      setError('VALIDATION_MISMATCH: TYPE PURGE TO ARM');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Truncate remote records via global bypass RPC
      const { error: rpcError } = await supabase.rpc('purge_all_data');
      if (rpcError) throw rpcError;

      // 2. Wipe local session storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. HARD HARDWARE RESET
      // Forces the browser to discard all cached assets and reload from source.
      console.log("SOVEREIGN_PROTOCOL: Global purge successful. Triggering hard hardware reset.");
      window.location.reload(); 

    } catch (err: any) {
      setError(`PURGE_SEQUENCE_FAULT: ${err.message?.toUpperCase()}`);
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-950 border-2 border-red-500/20 p-12 rounded-[4rem] text-left shadow-[0_50px_100px_-20px_rgba(239,68,68,0.2)] relative overflow-hidden backdrop-blur-3xl animate-in fade-in zoom-in-95 duration-700">
      <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
        <Biohazard size={200} className="text-red-500" />
      </div>
      
      <div className="flex items-center gap-6 mb-10 relative z-10">
        <div className="p-5 bg-red-500/10 rounded-[2rem] border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
          <ShieldAlert className="text-red-500" size={40} />
        </div>
        <div>
          <h3 className="text-3xl font-black text-white uppercase italic tracking-widest leading-none">Architect Purge</h3>
          <p className="text-[10px] font-black text-red-500/60 uppercase tracking-[0.4em] italic mt-3 leading-none">Nexus Admin Access Only</p>
        </div>
      </div>

      <div className="space-y-10 relative z-10">
        <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest leading-relaxed italic opacity-80">
          WARNING: This command truncates all championship records globally. A hard cache reload (HARD_SYNC) will be triggered instantly.
        </p>
        
        <div className="space-y-5">
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="TYPE 'PURGE' TO ARM"
            className="w-full bg-black border border-red-500/30 px-8 py-6 text-white font-black rounded-[2rem] focus:outline-none focus:border-red-500 transition-all uppercase italic text-sm text-center shadow-inner placeholder:text-red-500/10"
          />
          
          <button
            onClick={handleSystemPurge}
            disabled={loading || confirmation !== 'PURGE'}
            className="w-full py-8 bg-red-600 text-white border border-red-400/30 rounded-[2.5rem] font-black uppercase italic tracking-[0.7em] flex items-center justify-center gap-6 hover:bg-red-500 transition-all shadow-2xl text-base"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : (
              <>
                <RefreshCw size={28} />
                Execute Purge & Hard Sync
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-10 p-6 bg-black/80 rounded-3xl text-red-500 text-[11px] font-black border border-red-500/20 uppercase tracking-widest italic animate-in slide-in-from-top-4">
          <span className="flex items-center gap-3"><Biohazard size={16}/> {error}</span>
        </div>
      )}
    </div>
  );
};

export default KillSwitch;