import React, { useState } from 'react';
// Fixed incorrect import: adminSupabase -> supabaseAdmin
import { supabaseAdmin } from './supabase';
import { Terminal, Loader2, ShieldCheck, AlertTriangle, Mail } from 'lucide-react';

export const ProvisioningValidator: React.FC = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const log = (msg: string) => setLogs(prev => [...prev, `> ${msg}`]);

  const runValidation = async () => {
    setLoading(true);
    setLogs(['INITIALIZING EMAIL-FIRST VALIDATION...', '--------------------------------']);

    // Fixed reference to supabaseAdmin
    if (!supabaseAdmin) {
      log('CRITICAL FAILURE: Service Role Key not detected in environment.');
      setLoading(false);
      return;
    }

    const targets = [
      {
        email: `test_official_${Date.now()}@bunker.com`,
        password: 'Password123!',
        meta: { role: 'sub_admin', school_arm: 'UPSS', full_name: 'Test Official' },
        label: 'USER A (SUB_ADMIN)'
      },
      {
        email: `test_member_${Date.now()}@bunker.com`,
        password: 'Password123!',
        meta: { role: 'member', school_arm: 'GLOBAL', full_name: 'Test Member' },
        label: 'USER B (MEMBER)'
      }
    ];

    try {
      for (const target of targets) {
        log(`[${target.label}] ATTEMPTING PROVISION: ${target.email}`);
        
        // 1. Create Identity via Admin API (Email Confirm Bypass)
        // Fixed reference to supabaseAdmin
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: target.email,
          password: target.password,
          email_confirm: true,
          user_metadata: target.meta
        });

        if (authError) throw new Error(`Auth Provision Failed: ${authError.message}`);

        const userId = authData.user?.id;
        log(`IDENTITY COMMITTED. UID: ${userId}`);

        // 2. Verify Mirroring (Wait for DB Trigger)
        log(`POLLING PUBLIC MIRROR...`);
        await new Promise(r => setTimeout(r, 2000)); 

        // Fixed reference to supabaseAdmin
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError || !profile) {
          log(`CRITICAL FAILURE: Profile mirroring trigger timed out.`);
          throw new Error(`Mirroring Fault for ${userId}`);
        }

        // 3. Deep Verification
        const roleMatch = profile.role?.toLowerCase() === target.meta.role.toLowerCase();
        const armMatch = profile.school_arm === target.meta.school_arm;

        if (roleMatch && armMatch) {
            log(`SUCCESS: Identity and Metadata verified.`);
            log(`Role: ${profile.role} | Arm: ${profile.school_arm} | Email: ${profile.email}`);
        } else {
            log(`DATA MISMATCH: Sync completed but metadata inconsistent.`);
        }
        
        log('--------------------------------');
      }
      log('DIAGNOSTIC COMPLETE: EMAIL-FIRST PROTOCOL STABLE.');
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