
import React, { useState } from 'react';
import { X, Loader2, ChevronRight, Eye, EyeOff, ShieldCheck, Mail, Users, ChevronDown } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';
import { useSovereignStore } from './store';
import { AdminRole, SchoolArm } from './types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [showRoster, setShowRoster] = useState(false);
  
  const { login, isLoading, error: authError } = useAdminAuth();
  const setUser = useSovereignStore((state) => state.setUser);
  const mockUsers = useSovereignStore((state) => state.mockUsers);
  
  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim().toLowerCase();
    
    // 0. MASTER OVERRIDE HANDSHAKE
    if (cleanEmail === 'architect@sovereign.global' && password === 'admin') {
      setUser({
        id: 'ARCHITECT_MASTER',
        name: 'Sovereign Architect',
        email: cleanEmail,
        role: AdminRole.SUPER_KING,
        arm: SchoolArm.GLOBAL
      });
      window.history.pushState({}, '', '/admin/console');
      onClose();
      return;
    }

    // 1. CHECK MOCK USERS
    const matchingMock = mockUsers.find(u => u.email?.toLowerCase() === cleanEmail);
    if (matchingMock && password === (matchingMock.password || 'admin')) {
      setUser(matchingMock);
      // SOVEREIGN REDIRECT GATE [MOCK]
      let targetPath = '/spectator/view';
      if (matchingMock.role === AdminRole.SUPER_KING) targetPath = '/admin/console';
      else if (matchingMock.role === AdminRole.SUB_ADMIN) targetPath = '/official/tactical';
      else if (matchingMock.role === AdminRole.MEMBER) targetPath = '/spectator/view';

      window.history.pushState({}, '', targetPath);
      onClose();
      return;
    }

    // 2. SUPABASE HANDSHAKE
    const result = await login(cleanEmail, password);
    
    if (result) {
      setUser({
        id: result.user.id,
        name: result.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: result.role,
        arm: result.arm
      });

      // SOVEREIGN REDIRECT GATE [PRODUCTION]
      let targetPath = '/spectator/view';
      if (result.role === AdminRole.SUPER_KING) targetPath = '/admin/console';
      else if (result.role === AdminRole.SUB_ADMIN) targetPath = '/official/tactical';
      else if (result.role === AdminRole.MEMBER) targetPath = '/spectator/view';

      window.history.pushState({}, '', targetPath);
      onClose();
    }
  };

  const selectMockUser = (user: any) => {
    setEmail(user.email);
    setPassword(user.password || 'admin');
    setShowRoster(false);
  };

  const displayError = authError || localError;

  // Group users for the roster
  const superAdmins = mockUsers.filter(u => u.role === AdminRole.SUPER_KING);
  const subAdmins = mockUsers.filter(u => u.role === AdminRole.SUB_ADMIN);
  const members = mockUsers.filter(u => u.role === AdminRole.MEMBER && !u.email.startsWith('head.'));
  const heads = mockUsers.filter(u => u.email.startsWith('head.'));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={onClose} />
      
      {showRoster ? (
        <div className="w-full max-w-2xl bg-white border border-slate-100 shadow-[0_32px_128px_rgba(0,0,0,0.4)] rounded-[2rem] relative animate-in zoom-in-95 duration-300 max-h-[80vh] flex flex-col overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <div className="flex items-center gap-3">
               <Users size={20} className="text-indigo-600" />
               <h3 className="font-black text-slate-900 uppercase italic tracking-wide">Tactical Roster</h3>
             </div>
             <button onClick={() => setShowRoster(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
           </div>
           <div className="overflow-y-auto p-6 space-y-8">
             {[
               { title: 'High Command', users: superAdmins, color: 'text-indigo-600', bg: 'bg-indigo-50' },
               { title: 'Sector Command', users: subAdmins, color: 'text-emerald-600', bg: 'bg-emerald-50' },
               { title: 'Admin Heads', users: heads, color: 'text-amber-600', bg: 'bg-amber-50' },
               { title: 'Operatives', users: members, color: 'text-slate-600', bg: 'bg-slate-50' }
             ].map((group) => (
               <div key={group.title}>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">{group.title}</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   {group.users.map(u => (
                     <button 
                       key={u.id}
                       onClick={() => selectMockUser(u)}
                       className={`p-3 rounded-xl text-left border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all group ${group.bg}`}
                     >
                       <div className={`text-[10px] font-black uppercase tracking-wide mb-0.5 ${group.color}`}>{u.name}</div>
                       <div className="text-[9px] font-mono text-slate-400 truncate">{u.email}</div>
                     </button>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white border border-slate-100 shadow-[0_32px_128px_rgba(0,0,0,0.2)] p-12 rounded-[3rem] relative animate-in zoom-in-95 duration-500 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
          <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-slate-600 transition-colors p-2 hover:bg-slate-50 rounded-xl">
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center mb-10">
             <div className="p-5 bg-indigo-50 text-indigo-600 rounded-[1.5rem] mb-6 shadow-sm">
                <Mail size={36} />
             </div>
             <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter text-center">Uplink Access</h2>
             <p className="text-[10px] font-black text-slate-400 mt-3 text-center px-4 uppercase tracking-[0.3em] italic opacity-60 leading-relaxed">Identity Handshake v9.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
             <div className="space-y-2.5">
                <div className="flex justify-between items-center px-1">
                   <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Email Address</label>
                   <button type="button" onClick={() => setShowRoster(true)} className="text-[9px] font-bold uppercase tracking-widest text-indigo-500 hover:text-indigo-600 flex items-center gap-1">
                     <Users size={12} /> Roster
                   </button>
                </div>
                <input 
                  required 
                  type="email" 
                  autoComplete="email" 
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  title="Please enter a valid email address (e.g. director@sovereign.upss)"
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-black rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all uppercase placeholder:normal-case italic text-lg shadow-inner" 
                  placeholder="director@sovereign.upss" 
                />
             </div>
             <div className="space-y-2.5">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Cipher Key</label>
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 px-6 py-5 text-slate-900 font-medium rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all pr-14 text-lg shadow-inner" placeholder="••••••••" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors p-1">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>
             </div>
             {displayError && (
                <div className="p-5 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-start gap-4 italic animate-in slide-in-from-top-2 leading-relaxed">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1 shrink-0 animate-pulse" />
                  <span>FAULT_DETECTED: {displayError}</span>
                </div>
             )}
             <button type="submit" disabled={isLoading} className="w-full py-6 bg-slate-900 text-white font-black uppercase italic tracking-[0.4em] rounded-[1.5rem] hover:bg-indigo-600 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] disabled:opacity-50">
               {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                 <>
                   <span>Authorize Uplink</span>
                   <ChevronRight size={20} />
                 </>
               )}
             </button>
          </form>
          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-3 text-slate-400">
             <ShieldCheck size={18} className="text-emerald-500" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] italic opacity-40">Identity Managed via Sovereign Core</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginModal;
