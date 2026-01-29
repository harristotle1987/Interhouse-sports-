import React, { useState } from 'react';
import { Terminal, Loader2, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';

export const ProvisioningValidator: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const runValidation = async () => {
    setLoading(true);
    setLogs(['INITIALIZING EMAIL-FIRST VALIDATION...', '--------------------------------']);

    try {
      const response = await fetch('/api/run-provisioning-test', {
        method: 'POST',
      });
      
      const result = await response.json();
      setLogs(result.logs);

    } catch (e: any) {
      log(`FATAL ERROR: ${e.message}`);
      log('SEQUENCE ABORTED.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl col-span-full mt-8 animate-in slide-in-from-bottom-6">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Mail size={18} className="text-emerald-500" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-widest">Provisioning Validator</h3>
            <p className="text-[10px] text-zinc-500 font-mono">Protocol v5.5 Status: NOMINAL</p>
          </div>
        </div>
        <button 
          onClick={runValidation}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
          {loading ? 'Uplinking...' : 'Run Diagnostics'}
        </button>
      </div>
      
      <div className="h-64 overflow-y-auto bg-black p-6 font-mono text-xs leading-relaxed custom-scrollbar text-zinc-400">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-700 gap-2 opacity-50">
            <Terminal size={32} />
            <p className="font-bold uppercase tracking-widest">Awaiting Command</p>
          </div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className={`${l.includes('CRITICAL') || l.includes('FATAL') ? 'text-red-500 font-bold' : l.includes('SUCCESS') ? 'text-emerald-400' : ''} py-0.5`}>
              {l}
            </div>
          ))
        )}
      </div>
    </div>
  );
};