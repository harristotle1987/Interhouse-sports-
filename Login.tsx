
import React, { useState } from 'react';
import { Lock, Loader2, ChevronRight, X, Eye, EyeOff, Mail, Users, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from './useAdminAuth';
import { useSovereignStore } from './store';
import { AdminRole, SchoolArm } from './types';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  const { login, isLoading, error: authError } = useAdminAuth();
  const setUser = useSovereignStore((state) => state.setUser);
  const mockUsers = useSovereignStore((state) => state.mockUsers);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLocalError(null);

    const cleanEmail = email.trim().toLowerCase();
    
    // This now handles ALL logins, ensuring a valid Supabase session is created.
    const result = await login(cleanEmail, password);
    
    if (result) {
      setUser({
        id: result.user.id,
        name: result.user.user_metadata?.full_name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: result.role,
        arm: result.arm
      });

      window.history.pushState({}, '', result.targetPath);
      onLoginSuccess();
    } else {
      setLocalError("Operative verification failed. Identity not recognized.");
    }
  };

  const selectMockUser = (user: any) => {
    setEmail(user.email);
    setPassword(user.password || 'admin');
    setShowRoster(false);
  };

  const displayError = localError || authError;

  // Group users for the roster
  const superAdmins = mockUsers.filter(u => u.role === AdminRole.SUPER_KING);
  const subAdmins = mockUsers.filter(u => u.role === AdminRole.SUB_ADMIN);
  const members = mockUsers.filter(u => u.role === AdminRole.MEMBER && !u.email.startsWith('head.'));
  const heads = mockUsers.filter(u => u.email.startsWith('head.'));

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 relative overflow-hidden font-sans">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {showRoster ? (
        <div className="w-full max-w-4xl bg-[#0a0a0a] border border-zinc-800 shadow-2xl relative animate-in zoom-in-95 duration-500 max-h-[85vh] flex flex-col z-10">
           <div className="p-8 border-b border-zinc-800 flex items-center justify-between">
             <div className="flex items-center gap-4">
               <Users size={24} className="text-emerald-500" />
               <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Tactical Roster</h3>
             </div>
             <button onClick={() => setShowRoster(false)} className="text-zinc-500 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><ArrowLeft size={16}/> Return</button>
           </div>
           <div className="overflow-y-auto p-8 space-y-10 custom-scrollbar">
             {[
               { title: 'High Command', users: superAdmins, color: 'text-indigo-400', border: 'border-indigo-500/20', bg: 'hover:bg-indigo-500/10' },
               { title: 'Sector Command', users: subAdmins, color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'hover:bg-emerald-500/10' },
               { title: 'Admin Heads', users: heads, color: 'text-amber-400', border: 'border-amber-500/20', bg: 'hover:bg-amber-500/10' },
               { title: 'Field Operatives', users: members, color: 'text-zinc-400', border: 'border-zinc-800', bg: 'hover:bg-zinc-800' }
             ].map((group) => (
               <div key={group.title}>
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 italic">{group.title}</h4>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {group.users.map(u => (
                     <button 
                       key={u.id}
                       onClick={() => selectMockUser(u)}
                       className={`p-4 rounded-xl text-left border transition-all group ${group.border} ${group.bg}`}
                     >
                       <div className={`text-[10px] font-black uppercase tracking-wide mb-1 ${group.color}`}>{u.name}</div>
                       <div className="text-[9px] font-mono text-zinc-500 truncate group-hover:text-zinc-300 transition-colors">{u.email}</div>
                     </button>
                   ))}
                 </div>
               </div>
             ))}
           </div>
        </div>
      ) : (
        <div className="max-w-xl w-full relative z-10 animate-in fade-in zoom-in duration-700">
          <div className="flex flex-col items-center mb-12">
            <div className="p-10 bg-[#0a0a0a] border border-zinc-800 rotate-[-4deg] mb-10 shadow-[0_30px_60px_rgba(0,0,0,1)] group hover:rotate-0 transition-all duration-700">
              <Mail size={64} className="text-white" />
            </div>
            <h1 className="text-6xl font-black uppercase italic tracking-tighter text-white leading-none text-center">
              Operative<br/><span className="text-zinc-800">Uplink</span>
            </h1>
          </div>

          <div className="bg-[#0a0a0a] border border-zinc-800 p-10 shadow-[32px_32px_0px_0px_#000] relative overflow-hidden">
            <form onSubmit={(e) => handleLogin(e)} className="flex flex-col gap-y-8" autoComplete="on">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Email Address</label>
                   <button type="button" onClick={() => setShowRoster(true)} className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 flex items-center gap-2">
                     <Users size={12} /> View Roster
                   </button>
                </div>
                <input 
                  required
                  name="email"
                  type="email" 
                  autoComplete="email"
                  pattern="[^@\s]+@[^@\s]+\.[^@\s]+"
                  title="Please enter a valid email address (e.g. director@sovereign.upss)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-zinc-800 px-6 py-5 text-white font-black tracking-tight focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-900 text-lg italic uppercase"
                  placeholder="DIRECTOR@SOVEREIGN.UPSS"
                />
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-500 ml-1">Password</label>
                <div className="relative">
                  <input 
                    required
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-black border border-zinc-800 px-6 py-5 text-white font-black tracking-tight focus:outline-none focus:border-emerald-500 transition-all text-lg"
                    placeholder="••••••••"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-5 text-zinc-800 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </div>
              </div>

              {displayError && (
                <div className="p-5 bg-red-950/10 border border-red-900/30 text-red-500 font-black uppercase text-[11px] italic tracking-widest flex items-center gap-4 animate-in slide-in-from-top-2">
                  <X size={20} />
                  <span>Error: {displayError}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="mt-4 w-full py-6 bg-zinc-900 border border-zinc-800 text-white font-black uppercase italic tracking-[0.4em] hover:bg-emerald-600 hover:text-black hover:border-emerald-500 transition-all flex items-center justify-center gap-5 group disabled:opacity-20 shadow-2xl"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    <span className="text-lg">Authorize</span>
                    <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;