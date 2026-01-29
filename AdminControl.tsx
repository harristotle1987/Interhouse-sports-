import React, { useState } from 'react';
import { 
  Shield, 
  UserPlus, 
  Mail, 
  Building, 
  CheckCircle, 
  AlertCircle, 
  Lock, 
  Cpu,
  Fingerprint,
  Key
} from 'lucide-react';
import { SchoolArm, AdminRole } from './types';

interface AdminControlProps {
  isDark: boolean;
}

const AdminControl: React.FC<AdminControlProps> = ({ isDark }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: AdminRole.MEMBER,
    arm: SchoolArm.GLOBAL 
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: result }));
    setShowPassword(true);
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/provision-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'An unknown error occurred.');
      }

      setSuccess(result.message);
      setFormData({ email: '', fullName: '', password: '', role: AdminRole.MEMBER, arm: SchoolArm.GLOBAL });
      setShowPassword(false);
      
    } catch (err: any) {
      setError(`PROTOCOL_FAILED: ${err.message?.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className={`flex items-center gap-6 mb-12 pb-8 border-b border-zinc-800`}>
        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-sm">
          <Shield className="text-emerald-500" size={32} />
        </div>
        <div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">Access Control</h2>
          <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mt-2 italic">Sector Provisioning Protocol</p>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-8`}>
        <div className={`lg:col-span-2 bg-[#0a0a0a] border border-zinc-800 p-8 relative overflow-hidden`}>
          {loading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
              <Cpu className="animate-spin text-emerald-500" size={48} />
            </div>
          )}
          
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
            <h3 className="text-lg font-bold uppercase italic text-white tracking-widest">New Operative</h3>
            <Fingerprint className="text-zinc-800" size={24} />
          </div>

          <form onSubmit={handleProvision} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Operative Name</label>
                <div className="relative">
                   <UserPlus className="absolute left-4 top-3.5 text-zinc-700" size={16} />
                   <input 
                      required
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-emerald-500 transition-all text-white" 
                      placeholder="e.g. CMDR. SHEPARD"
                   />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Secure Email</label>
                <div className="relative">
                   <Mail className="absolute left-4 top-3.5 text-zinc-700" size={16} />
                   <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-emerald-500 transition-all text-white" 
                      placeholder="OPERATIVE@SOVEREIGN.NET"
                   />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center pr-1">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Cipher Key</label>
                <button type="button" onClick={generatePassword} className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 uppercase tracking-widest italic">Generate</button>
              </div>
              <div className="relative">
                <input 
                  required
                  type={showPassword ? "text" : "password"} 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-4 pr-12 py-3 bg-black border border-zinc-800 text-sm font-mono tracking-tight focus:outline-none focus:border-emerald-500 transition-all text-white" 
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3 text-zinc-700 hover:text-zinc-500">
                  <Key size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Clearance Level</label>
                <div className="relative">
                   <Lock className="absolute left-4 top-3.5 text-zinc-700" size={16} />
                   <select 
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value as AdminRole})}
                      className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-emerald-500 transition-all appearance-none text-white" 
                   >
                     <option value={AdminRole.MEMBER}>MEMBER (READ_ONLY)</option>
                     <option value={AdminRole.SUB_ADMIN}>SUB_ADMIN (SCORING)</option>
                     <option value={AdminRole.SUPER_KING}>SUPER_KING (OMNIPOTENT)</option>
                   </select>
                </div>
              </div>

              {formData.role === AdminRole.SUB_ADMIN && (
                <div className="space-y-3 animate-in slide-in-from-left-2 fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Sector Node</label>
                  <div className="relative">
                     <Building className="absolute left-4 top-3.5 text-zinc-700" size={16} />
                     <select 
                        value={formData.arm}
                        onChange={e => setFormData({...formData, arm: e.target.value as SchoolArm})}
                        className="w-full pl-12 pr-4 py-3 bg-black border border-zinc-800 text-sm font-bold uppercase tracking-tight focus:outline-none focus:border-emerald-500 transition-all appearance-none text-white" 
                     >
                       <option value={SchoolArm.GLOBAL}>GLOBAL</option>
                       <option value={SchoolArm.UPSS}>UPSS NODE</option>
                       <option value={SchoolArm.CAM}>CAM NODE</option>
                       <option value={SchoolArm.CAGS}>CAGS NODE</option>
                     </select>
                  </div>
                </div>
              )}
            </div>

            {success && (
               <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-emerald-500 text-xs font-bold uppercase italic">
                  <CheckCircle size={14} />
                  {success}
               </div>
            )}

            {error && (
               <div className="p-4 bg-red-950/20 border border-red-500/30 flex items-center gap-3 text-red-500 text-xs font-bold uppercase italic">
                  <AlertCircle size={14} />
                  {error}
               </div>
            )}

            <div className="pt-4 border-t border-zinc-900">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-zinc-900 text-white border border-zinc-800 font-black uppercase italic tracking-widest hover:bg-emerald-600 hover:text-black hover:border-emerald-500 transition-all disabled:opacity-30"
              >
                {loading ? 'ENCRYPTING...' : 'Authorize Operative'}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-1 space-y-8">
           <div className={`p-8 border bg-[#0a0a0a] border-zinc-800`}>
              <h4 className="text-[10px] font-black uppercase mb-6 text-zinc-300 tracking-[0.2em]">Guidelines</h4>
              <ul className="space-y-6">
                 <li className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-black text-zinc-700 text-[10px] font-bold border border-zinc-800">01</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">Sub-Admins are bound to their assigned Sector Nodes.</p>
                 </li>
                 <li className="flex gap-4">
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-black text-zinc-700 text-[10px] font-bold border border-zinc-800 bundle-02">02</span>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase">Super Admins maintain full administrative sovereignty.</p>
                 </li>
              </ul>
           </div>

           <div className="p-8 border border-emerald-900/10 bg-emerald-950/5">
              <div className="flex items-center gap-3 mb-4 text-emerald-500">
                 <Lock size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Secure Uplink</span>
              </div>
              <p className="text-[9px] font-mono text-zinc-600 uppercase italic">
                 Handshake active. Monitoring traffic via encrypted channel.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminControl;