
import React, { useState } from 'react';
import { supabaseAdmin, supabase } from './supabase';
import { 
  ShieldAlert, 
  UserPlus, 
  Mail, 
  Key, 
  ShieldCheck, 
  Loader2, 
  Fingerprint,
  LayoutGrid,
  Lock,
  ChevronDown,
  ShieldQuestion,
  Tooltip
} from 'lucide-react';
import { SchoolArm, AdminRole } from './types';
import { useSovereignStore } from './store';

/**
 * ADMIN PROVISIONING CORE [V11.2]
 * Hardened with Pre-flight Security Gate
 */
const AdminProvisioning: React.FC = () => {
  const { user: currentUser } = useSovereignStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // PRE-FLIGHT VAULT VALIDATION
  const isVaultAuthorized = !!supabaseAdmin;

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: AdminRole.MEMBER,
    arm: SchoolArm.UPSS
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^*';
    let result = '';
    for (let i = 0; i < 16; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password: result }));
    setShowPassword(true);
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // SECURITY GATE
    if (!supabaseAdmin) {
      setError("CRITICAL: VAULT KEY DISCONNECTED");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      // EXECUTE: Admin Namespace Uplink (Signed with Service Role)
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.fullName.toUpperCase(),
          role: formData.role === AdminRole.SUB_ADMIN ? 'sub_admin' : 'member',
          school_arm: formData.role === AdminRole.SUB_ADMIN ? formData.arm : 'GLOBAL'
        }
      });

      if (authError) throw authError;

      // Log Audit Entry
      await supabase.from('provision_logs').insert({
        admin_id: currentUser?.id,
        target_email: cleanEmail,
        created_at: new Date().toISOString()
      });

      setSuccess(`IDENTITY_PROVISIONED: ${cleanEmail}`);
      setFormData({ email: '', fullName: '', password: '', role: AdminRole.MEMBER, arm: SchoolArm.UPSS });
      setShowPassword(false);
      
    } catch (err: any) {
      setError(`HANDSHAKE_FAULT: ${err.message?.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden text-left animate-in fade-in slide-in-from-bottom-8">
      <div className={`absolute top-0 left-0 w-full h-2 ${isVaultAuthorized ? 'bg-indigo-600' : 'bg-red-500'}`}></div>
      
      <div className="flex items-center gap-6 mb-12 pb-10 border-b border-slate-50">
        <div className={`p-5 text-white rounded-[1.5rem] shadow-xl ${isVaultAuthorized ? 'bg-indigo-600' : 'bg-red-500'}`}>
          <UserPlus size={32} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Architect Provisioning</h2>
          <div className="mt-3">
            {isVaultAuthorized ? (
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] italic flex items-center gap-2">
                <ShieldCheck size={12} /> Vault Link Status: SECURE
              </span>
            ) : (
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] italic flex items-center gap-2">
                <ShieldAlert size={12} /> Vault Link Status: DISCONNECTED
              </span>
            )}
          </div>
        </div>
        <Fingerprint className="ml-auto text-slate-50 hidden md:block" size={80} />
      </div>

      {!isVaultAuthorized && (
        <div className="mb-10 p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-6 text-red-700 text-[11px] font-black uppercase italic tracking-[0.2em] animate-pulse">
          <ShieldQuestion size={32} className="shrink-0" />
          <div className="space-y-1">
            <p>System Configuration Failure: Vault Key Missing.</p>
            <p className="opacity-60 text-[9px]">Contact System Architect to re-link SUPABASE_SERVICE_ROLE_KEY.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleProvision} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Full Name</label>
            <input 
              required
              disabled={!isVaultAuthorized}
              type="text" 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all uppercase italic text-sm shadow-inner disabled:opacity-30 disabled:cursor-not-allowed"
              placeholder="e.g. CMDR. VANCE"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Operative Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                disabled={!isVaultAuthorized}
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 pl-16 pr-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-inner italic uppercase disabled:opacity-30 disabled:cursor-not-allowed"
                placeholder="operative@sovereign.node"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Secure Cipher</label>
            <button 
              type="button" 
              disabled={!isVaultAuthorized}
              onClick={generatePassword} 
              className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest italic border-b-2 border-indigo-100 pb-0.5 disabled:opacity-0"
            >
              Auto-Gen Protocol
            </button>
          </div>
          <div className="relative">
            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              required
              disabled={!isVaultAuthorized}
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 pl-16 pr-16 py-5 text-slate-900 font-mono rounded-2xl focus:outline-none focus:border-indigo-600 transition-all text-lg shadow-inner disabled:opacity-30"
              placeholder="••••••••••••••••"
            />
            <button 
              type="button" 
              disabled={!isVaultAuthorized}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600"
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Clearance Matrix</label>
            <div className="relative">
              <select 
                disabled={!isVaultAuthorized}
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as AdminRole})}
                className="w-full bg-slate-50 border border-slate-200 px-8 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer text-sm italic uppercase disabled:opacity-30"
              >
                <option value={AdminRole.MEMBER}>FIELD_OPERATIVE (VIEWER)</option>
                <option value={AdminRole.SUB_ADMIN}>SECTOR_OFFICIAL (EDITOR)</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
            </div>
          </div>

          <div className={`space-y-3 transition-all ${formData.role === AdminRole.SUB_ADMIN ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Sector Node</label>
            <div className="relative">
              <select 
                disabled={formData.role !== AdminRole.SUB_ADMIN || !isVaultAuthorized}
                value={formData.arm}
                onChange={e => setFormData({...formData, arm: e.target.value as SchoolArm})}
                className="w-full bg-slate-50 border border-slate-200 px-8 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 appearance-none cursor-pointer text-sm italic uppercase"
              >
                <option value={SchoolArm.UPSS}>UPSS_NODE</option>
                <option value={SchoolArm.CAM}>CAM_NODE</option>
                <option value={SchoolArm.CAGS}>CAGS_NODE</option>
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {success && (
          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-5 text-emerald-700 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95">
            <ShieldCheck size={28} className="shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-5 text-red-700 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95">
            <ShieldAlert size={28} className="shrink-0" />
            {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading || !isVaultAuthorized}
          className="w-full py-8 bg-slate-900 text-white font-black uppercase italic tracking-[0.6em] rounded-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-[0.98] disabled:opacity-50 disabled:bg-slate-300 text-lg group relative"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={28} />
          ) : (
            <>
              {isVaultAuthorized ? 'Commit Identity Provisioning' : 'Vault Key Missing'}
              <Fingerprint className="group-hover:rotate-12 transition-transform" size={24} />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminProvisioning;
