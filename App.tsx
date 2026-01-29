
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { AdminRole, SchoolArm } from './types';
import { useSovereignStore } from './store';
import Home from './Home';
import TournamentBracket from './TournamentBracket';
import SubAdminConsole from './SubAdminConsole';
import SuperAdminDashboard from './SuperAdminDashboard';
import MemberLeaderboard from './MemberLeaderboard';
import MobileApp from './MobileApp';
import { 
  Loader2, 
  Shield, 
  LayoutDashboard, 
  BarChart3, 
  GitPullRequest, 
  Users, 
  Plus, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  ChevronRight,
} from 'lucide-react';

const useDeviceType = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return { isMobile };
};

const DesktopApp: React.FC = () => {
  const { user, handleSignOut } = useSovereignStore(state => ({
    user: state.user,
    handleSignOut: state.clearSession
  }));
  const [activeTab, setActiveTab] = useState<'home' | 'bracket' | 'create' | 'users' | 'telemetry'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    handleSignOut();
    window.location.href = '/';
  };

  const renderTabContent = () => {
    if (!user) return <Home />;
    switch (activeTab) {
      case 'home':
        if (user.role === AdminRole.SUPER_KING) return <SuperAdminDashboard />;
        if (user.role === AdminRole.SUB_ADMIN) return <SubAdminConsole admin={user} onEventCreated={() => setActiveTab('home')} />;
        return <SuperAdminDashboard />; // Default for desktop
      case 'telemetry':
        return <MemberLeaderboard />;
      case 'bracket':
        return <TournamentBracket />;
      case 'create':
         if (user.role === AdminRole.MEMBER) return <SuperAdminDashboard />;
        return <SubAdminConsole admin={user} onEventCreated={() => setActiveTab('home')} />;
      case 'users':
        if (user.role !== AdminRole.SUPER_KING) return <SuperAdminDashboard />;
        return <SuperAdminDashboard />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  const NavItem = ({ id, icon: Icon, label, path }: { id: typeof activeTab, icon: any, label: string, path: string }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        setSidebarOpen(false);
        window.history.pushState({}, '', path);
      }} 
      className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group ${
        activeTab === id 
          ? 'bg-slate-900 text-white font-bold shadow-xl shadow-slate-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
      {activeTab === id && <ChevronRight size={14} className="ml-auto opacity-50" />}
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-200 flex flex-col transition-transform duration-500 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        <div className="p-10 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
              <Shield size={24} className="text-white" />
            </div>
            <div className="text-left">
              <h1 className="font-black text-xl text-slate-900 leading-none uppercase italic tracking-tighter">Sovereign</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 italic opacity-60">Architect v9.0</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-2"><X size={24} /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-10 px-6 space-y-12">
          <div>
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-5 mb-5 italic text-left">Navigation</div>
            <div className="space-y-1.5">
              <NavItem id="home" icon={LayoutDashboard} label="Nexus Control" path="/" />
              <NavItem id="telemetry" icon={BarChart3} label="Live Ledger" path="/spectator/view" />
              <NavItem id="bracket" icon={GitPullRequest} label="Tournament" path="/bracket" />
            </div>
          </div>
          {user && user.role !== AdminRole.MEMBER && (
            <div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-5 mb-5 italic text-left">Management</div>
              <div className="space-y-1.5">
                {user.role === AdminRole.SUPER_KING && <NavItem id="users" icon={Users} label="Operatives" path="/admin/console" />}
                <NavItem id="create" icon={Plus} label="Provision" path={user.arm ? `/official/tactical/${user.arm.toLowerCase()}` : '/official/tactical'} />
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100">
          <button onClick={onSignOut} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all group font-black uppercase text-[10px] tracking-widest italic">
            <LogOut size={18} className="group-hover:text-red-500" />
            <span>Exit Bunker</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-10">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors"><Menu size={24} /></button>
          <div className="relative hidden xl:block w-[480px]">
            <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
            <input type="text" placeholder="SEARCH SYSTEM TELEMETRY..." className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-900 uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all placeholder:text-slate-300 text-left" />
          </div>
          <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block space-y-0.5">
              <p className="text-[11px] font-black text-slate-900 leading-none uppercase italic">{user?.name}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.arm || 'Global'} Sector</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black border-2 border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">
              {user?.name?.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto bg-slate-50 p-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const { user, setUser, clearSession } = useSovereignStore();
  const [authLoading, setAuthLoading] = useState(true);
  const initialized = useRef(false);
  const { isMobile } = useDeviceType();

  const fetchProfile = useCallback(async (sessionUser: User) => {
    try {
      setAuthLoading(true);
      const { data } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
      
      const roleMap: Record<string, AdminRole> = { 'super_admin': AdminRole.SUPER_KING, 'super_king': AdminRole.SUPER_KING, 'sub_admin': AdminRole.SUB_ADMIN, 'member': AdminRole.MEMBER };
      const metadata = sessionUser.user_metadata || {};
      const metaRole = (metadata.role || 'member').toLowerCase();
      
      const resolvedRole = roleMap[data?.role?.toLowerCase() || metaRole] || AdminRole.MEMBER;
      const resolvedArm = (data?.school_arm || metadata.school_arm || 'GLOBAL').toUpperCase() as SchoolArm;

      setUser({ id: sessionUser.id, name: data?.full_name || metadata.full_name || 'Operative', email: sessionUser.email || '', role: resolvedRole, arm: resolvedArm });
    } catch (e) {
      console.error("GATE_FAULT", e);
    } finally {
      setAuthLoading(false);
    }
  }, [setUser]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user); else setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) fetchProfile(session.user);
      else if (event === 'SIGNED_OUT') {
        clearSession();
        setAuthLoading(false);
        window.history.replaceState({}, '', '/');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, clearSession]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black opacity-60"></div>
         <div className="relative z-10 flex flex-col items-center gap-10 animate-in fade-in zoom-in duration-1000">
            <div className="p-8 bg-zinc-900 border border-emerald-500/20 rounded-[2rem] shadow-[0_0_80px_rgba(16,185,129,0.15)] relative">
               <Shield className="text-emerald-500 relative z-10" size={64} strokeWidth={1} />
            </div>
            <div className="text-center space-y-6">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sovereign<span className="text-zinc-700">Gate</span></h2>
               <Loader2 className="animate-spin text-emerald-500/80" size={24} />
            </div>
         </div>
      </div>
    );
  }

  if (!user) return <Home />;

  // DEVICE-ROLE ISOLATION GATE
  if (isMobile && user.role === AdminRole.MEMBER) {
    return <MobileApp />;
  }

  // Default to Desktop Command Center
  return <DesktopApp />;
};

export default App;
