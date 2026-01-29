import React, { useState } from 'react';
import { 
  Shield, UserPlus, CheckCircle, Database, Search, RefreshCw, Trash2, Key, Mail, AlertCircle, Loader2, Lock
} from 'lucide-react';
import { SchoolArm, AdminRole } from './types';
import { useOperativeLedger } from './hooks/useOperativeLedger';

interface AdminProps {
  isDark: boolean;
}

const Admin: React.FC<AdminProps> = ({ isDark }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { operatives, loading: listLoading, refetch: fetchLedger } = useOperativeLedger();

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: AdminRole.SUPER_KING,
    arm: SchoolArm.GLOBAL 
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$';
    let result = '';
    for (let i = 0; i < 12; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData(prev => ({ ...prev, password: result }));
    setShowPassword(true);
  };

  const handleProvisioning = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/create-super-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSuccess(result.message);
      setFormData({ email: '', fullName: '', password: '', role: AdminRole.SUPER_KING, arm: SchoolArm.GLOBAL });
      setShowPassword(false);
      
      setTimeout(() => fetchLedger(), 1000); 
    } catch (err: any) {
      setError(err.message?.toUpperCase() || "HANDSHAKE FAILED");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`CAUTION: Delete identity ${name}? This action is immutable.`)) return;
    setLoading(true);
    try {
      const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      setSuccess(result.message);
      fetchLedger();
    } catch (err: any) {
      setError(`FAULT: ${err.message?.toUpperCase()}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredOperatives = operatives.filter(op => 
    (op?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (op?.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-6 duration-1000 space-y-12 pb-32 text-left">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 pb-12 border-b border-slate-200">
        <div className="space-y-4">
          <div className="flex items-center gap-8">
            <div className="p-6 bg-indigo-600 text-white rounded-[2rem] shadow-2xl">
              <Shield size={40} />
            </div>
            <div>
              <h2 className="text-5xl font-black text-slate-900 uppercase italic leading-none tracking-tight">Personnel Registry</h2>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.5em] mt-4 italic">Sovereign Identity Core v9.0</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 bg-white border border-slate-200 p-3 rounded-[2rem] shadow-sm">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
              <input 
                type="text" 
                placeholder="SEARCH IDENTITIES..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl pl-16 pr-8 py-5 text-base font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all w-full lg:w-[400px] uppercase italic shadow-inner"
              />
           </div>
           <button onClick={() => fetchLedger()} className="p-5 bg-white border border-slate-100 text-slate-400 hover:text-indigo-600 rounded-2xl transition-all shadow-sm">
             <RefreshCw size={28} className={listLoading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-12">
           <div className="flex items-center justify-between px-8">
              <h3 className="text-sm font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-4 italic">
                <Database size={20} className="text-indigo-400" /> Authorized Operatives
              </h3>
              <span className="text-[11px] font-black text-white bg-slate-900 px-6 py-2 rounded-full uppercase italic tracking-[0.2em] shadow-xl">{operatives.length} Entities</span>
           </div>
           
           <div className="grid gap-8">
              {filteredOperatives.map((op) => (
                <div key={op.id} className="bg-white border border-slate-100 p-8 flex flex-col md:flex-row items-center justify-between gap-10 group hover:border-indigo-300 rounded-[3rem] shadow-sm transition-all hover:shadow-2xl">
                  <div className="flex items-center gap-10 flex-1">
                    <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600 transition-all group-hover:scale-110 shadow-sm">
                       <Mail size={32} />
                    </div>
                    <div className="space-y-4">
                       <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                         <h4 className="text-3xl font-black text-slate-900 leading-none uppercase italic tracking-tight">{op.full_name || 'ANONYMOUS'}</h4>
                         <span className="px-4 py-1.5 bg-slate-50 rounded-xl text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest italic border border-slate-100">{op.email}</span>
                       </div>
                       <div className="flex items-center gap-8">
                          <span className={`text-[11px] font-black uppercase tracking-[0.4em] italic px-4 py-1.5 rounded-xl ${
                            op.role === 'super_king' ? 'bg-indigo-900 text-white' : 'bg-slate-50 text-slate-400'
                          }`}>{op.role?.replace('_', ' ')}</span>
                          <span className="text-[11px] font-black text-indigo-600 uppercase tracking-[0.4em] italic leading-none">{op.school_arm} SECTOR</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => handleDeleteUser(op.id, op.full_name)} className="p-6 bg-red-50 text-red-400 hover:text-white hover:bg-red-600 rounded-3xl transition-all shadow-sm border border-red-50">
                      <Trash2 size={28} />
                    </button>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="xl:col-span-4 space-y-12">
           <div className="bg-white border border-slate-100 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600"></div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-12 mb-12">
                 <div className="flex items-center gap-6">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem] shadow-sm"><UserPlus size={32} /></div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-[0.3em] italic">Provision Admin</h3>
                 </div>
              </div>

              <form onSubmit={handleProvisioning} className="space-y-8">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-1 italic">Full Identity</label>
                    <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-black uppercase italic focus:outline-none focus:border-indigo-500 transition-all text-sm shadow-inner" placeholder="OFFICIAL NAME" />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-1 italic">Uplink Email</label>
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-black uppercase italic focus:outline-none focus:border-indigo-500 transition-all text-sm shadow-inner" placeholder="vance@sovereign.local" />
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                       <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-1 italic">Cipher Key</label>
                       <button type="button" onClick={generatePassword} className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest italic leading-none">Auto-Gen</button>
                    </div>
                    <div className="relative">
                       <input required type={showPassword ? "text" : "password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-all pr-14 shadow-inner" />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"><Key size={24} /></button>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                       <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-1 italic flex items-center gap-1"><Lock size={8}/> Clearance</label>
                       <select disabled value={AdminRole.SUPER_KING} className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-5 text-slate-400 font-black uppercase italic focus:outline-none text-xs appearance-none">
                         <option value={AdminRole.SUPER_KING}>SUPER_KING</option>
                       </select>
                    </div>
                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                       <label className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 ml-1 italic flex items-center gap-1"><Lock size={8}/> Sector</label>
                       <select disabled value={SchoolArm.GLOBAL} className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-5 text-slate-400 font-black uppercase italic focus:outline-none text-xs appearance-none">
                         <option value={SchoolArm.GLOBAL}>GLOBAL</option>
                       </select>
                    </div>
                 </div>
                 
                 {success && <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-5 text-emerald-700 text-[11px] font-black uppercase italic tracking-widest leading-relaxed"><CheckCircle size={24} className="shrink-0" /><span>{success}</span></div>}
                 {error && <div className="p-6 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-5 text-red-700 text-[11px] font-black uppercase italic tracking-widest leading-relaxed text-left"><AlertCircle size={24} className="shrink-0" /><span>{error}</span></div>}
                 
                 <button type="submit" disabled={loading} className="w-full py-7 bg-slate-900 text-white font-black uppercase italic tracking-[0.6em] rounded-[2rem] hover:bg-indigo-600 transition-all shadow-2xl active:scale-[0.98] disabled:opacity-50 mt-6 flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="animate-spin" size={28} /> : 'Commit Identity'}
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;