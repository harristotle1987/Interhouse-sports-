import React, { useState } from 'react';
import { supabase } from './supabase';
import { AdminRole } from './types';
import { useSovereignStore } from './store';
import Home from './Home';
import TournamentBracket from './TournamentBracket';
import SubAdminConsole from './SubAdminConsole';
import SuperAdminDashboard from './SuperAdminDashboard';
import MemberLeaderboard from './MemberLeaderboard';
import { 
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

const CommandCenter: React.FC = () => {
  const { user, clearSession } = useSovereignStore(state => ({
    user: state.user,
    clearSession: state.clearSession
  }));
  const [activeTab, setActiveTab] = useState<'home' | 'bracket' | 'create' | 'users' | 'telemetry'>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const onSignOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    window.location.href = '/';
  };

  const renderTabContent = () => {
    if (!user) return <Home />;
    switch (activeTab) {
      case 'home':
        if (user.role === AdminRole.SUPER_KING) return <SuperAdminDashboard />;
        if (user.role === AdminRole.SUB_ADMIN) return <SubAdminConsole admin={user} onEventCreated={() => setActiveTab('home')} />;
        return <MemberLeaderboard />;
      case 'telemetry':
        return <MemberLeaderboard />;
      case 'bracket':
        return <TournamentBracket />;
      case 'create':
         if (user.role === AdminRole.MEMBER) return <MemberLeaderboard />; 
        return <SubAdminConsole admin={user} onEventCreated={() => setActiveTab('home')} />;
      case 'users':
        return <SuperAdminDashboard />;
      default:
        return <SuperAdminDashboard />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: typeof activeTab, icon: any, label: string }) => (
    <button 
      onClick={() => { 
        setActiveTab(id); 
        setSidebarOpen(false);
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
              <NavItem id="home" icon={LayoutDashboard} label="Nexus Control" />
              <NavItem id="telemetry" icon={BarChart3} label="Live Ledger" />
              <NavItem id="bracket" icon={GitPullRequest} label="Tournament" />
            </div>
          </div>
          {user && user.role !== AdminRole.MEMBER && (
            <div>
              <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] px-5 mb-5 italic text-left">Management</div>
              <div className="space-y-1.5">
                {user.role === AdminRole.SUPER_KING && <NavItem id="users" icon={Users} label="Operatives" />}
                <NavItem id="create" icon={Plus} label="Provision" />
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

export default CommandCenter;