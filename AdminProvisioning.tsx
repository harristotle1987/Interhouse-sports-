import React, { useState } from 'react';
import { supabaseAdmin } from './supabase';
import { 
  ShieldAlert, 
  UserPlus, 
  Mail, 
  Key, 
  ShieldCheck, 
  Loader2, 
  Fingerprint,
  ChevronDown,
  Building
} from 'lucide-react';
import { SchoolArm, AdminRole } from './types';
import { useSovereignStore } from './store';

/**
 * SOVEREIGN PROVISIONING HUB [V2.5 - GLOBAL ACCESS]
 * Purpose: Deploy identities for 8 members per house and 15 administrative heads.
 */
const AdminProvisioning: React.FC = () => {
  const { user: currentUser } = useSovereignStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const isArchitect = currentUser?.role === AdminRole.SUPER_KING;

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: AdminRole.MEMBER,
    arm: currentUser?.arm || SchoolArm.UPSS
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
    
    if (!supabaseAdmin) {
      setError("UPLINK_FAILURE: SERVICE VAULT KEY DISCONNECTED");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const cleanEmail = formData.email.trim().toLowerCase();

    try {
      // Identity Deployment Protocol
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.fullName.toUpperCase(),
          role: formData.role === AdminRole.SUB_ADMIN ? 'sub_admin' : (formData.role === AdminRole.SUPER_KING ? 'super_king' : 'member'),
          // ARCHITECT BYPASS: Allow selection of any sector node
          school_arm: isArchitect ? formData.arm : (currentUser?.arm || 'GLOBAL')
        }
      });

      if (authError) throw authError;

      setSuccess(`IDENTITY_DEPLOYED: ${cleanEmail.toUpperCase()}`);
      setFormData({ 
        email: '', 
        fullName: '', 
        password: '', 
        role: AdminRole.MEMBER, 
        arm: currentUser?.arm || SchoolArm.UPSS 
      });
      setShowPassword(false);
      
    } catch (err: any) {
      setError(`PROVISIONING_FAULT: ${err.message?.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden text-left animate-in fade-in slide-in-from-bottom-8">
      <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
      
      <div className="flex items-center gap-6 mb-12 pb-10 border-b border-slate-50">
        <div className="p-5 bg-indigo-600 text-white rounded-[1.5rem] shadow-xl">
          <UserPlus size={32} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col text-left">
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Operative Provisioning</h2>
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] italic mt-3 flex items-center gap-2">
            <ShieldCheck size={12} /> {isArchitect ? 'ARCHITECT_AUTHORITY_ACTIVE' : 'SECTOR_NODE_LOCK_ACTIVE'}
          </span>
        </div>
      </div>

      <form onSubmit={handleProvision} className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Full Identity</label>
            <input 
              required
              type="text" 
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all uppercase italic text-sm shadow-inner"
              placeholder="e.g. CMDR. VANCE"
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Uplink Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 pl-16 pr-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all text-sm shadow-inner italic uppercase"
                placeholder="operative@sovereign.node"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 text-left">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Secure Cipher</label>
            <button type="button" onClick={generatePassword} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic border-b-2 border-indigo-100 pb-0.5">Auto-Gen</button>
          </div>
          <div className="relative">
            <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              required
              type={showPassword ? "text" : "password"} 
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-50 border border-slate-200 pl-16 pr-6 py-5 text-slate-900 font-mono rounded-2xl focus:outline-none focus:border-indigo-600 transition-all text-lg shadow-inner"
              placeholder="••••••••••••••••"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Clearance Matrix</label>
            <div className="relative">
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value as AdminRole})}
                className="w-full bg-slate-50 border border-slate-200 px-8 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 transition-all appearance-none cursor-pointer text-sm italic uppercase"
              >
                <option value={AdminRole.MEMBER}>OPERATIVE (VIEWER)</option>
                <option value={AdminRole.SUB_ADMIN}>OFFICIAL (EDITOR)</option>
                {isArchitect && <option value={AdminRole.SUPER_KING}>ARCHITECT (KING)</option>}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
            </div>
          </div>

          <div className={`space-y-3 ${!isArchitect ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-1 italic">Sector Node {isArchitect ? '(GLOBAL)' : '(LOCKED)'}</label>
            <div className="relative">
              <select 
                disabled={!isArchitect}
                value={formData.arm}
                onChange={e => setFormData({...formData, arm: e.target.value as SchoolArm})}
                className="w-full bg-slate-50 border border-slate-200 px-10 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:border-indigo-600 appearance-none cursor-pointer text-sm italic uppercase"
              >
                <option value={SchoolArm.UPSS}>UPSS_NODE</option>
                <option value={SchoolArm.CAM}>CAM_NODE</option>
                <option value={SchoolArm.CAGS}>CAGS_NODE</option>
                <option value={SchoolArm.GLOBAL}>GLOBAL_NODE</option>
              </select>
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={20} />
            </div>
          </div>
        </div>

        {success && (
          <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-3xl flex items-center gap-5 text-emerald-700 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95">
            <ShieldCheck size={28} /> {success}
          </div>
        )}

        {error && (
          <div className="p-8 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-5 text-red-700 text-[11px] font-black uppercase italic tracking-widest animate-in zoom-in-95 text-left">
            <ShieldAlert size={28} /> {error}
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-8 bg-slate-900 text-white font-black uppercase italic tracking-[0.6em] rounded-3xl hover:bg-indigo-600 transition-all flex items-center justify-center gap-5 shadow-2xl active:scale-[0.98] disabled:opacity-50 text-lg"
        >
          {loading ? <Loader2 className="animate-spin" size={28} /> : (
            <>Deploy Identity Provisioning <Fingerprint size={24} /></>
          )}
        </button>
      </form>
    </div>
  );
};

export default AdminProvisioning;