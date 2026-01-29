
import React, { useState } from 'react';
import MemberDashboard from './MemberDashboard';
import MemberLeaderboard from './MemberLeaderboard';
import TournamentBracket from './TournamentBracket';
import { Activity, BarChart3, GitPullRequest, LogOut, Shield } from 'lucide-react';
import { useSovereignStore } from './store';
import { supabase } from './supabase';

type MobileTab = 'feed' | 'standings' | 'bracket';

const MobileApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('feed');
  const { user, clearSession } = useSovereignStore();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    clearSession();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <MemberDashboard />;
      case 'standings':
        return <MemberLeaderboard />;
      case 'bracket':
        return <TournamentBracket />;
      default:
        return <MemberDashboard />;
    }
  };

  const NavItem = ({ id, icon: Icon, label }: { id: MobileTab, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-300 py-2 rounded-2xl ${
        activeTab === id ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'
      }`}
    >
      <Icon size={24} strokeWidth={activeTab === id ? 3 : 2} />
      <span className="text-[10px] font-bold tracking-tight">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-900">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-black text-lg tracking-tighter text-white">Sovereign</span>
        </div>
        <button onClick={handleSignOut} className="p-2 text-slate-400">
          <LogOut size={20} />
        </button>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-black">
        <div className="animate-in fade-in duration-500">
          {renderContent()}
        </div>
      </main>

      <nav className="sticky bottom-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-800 p-4">
        <div className="flex justify-around items-start">
          <NavItem id="feed" icon={Activity} label="Live Feed" />
          <NavItem id="standings" icon={BarChart3} label="Standings" />
          <NavItem id="bracket" icon={GitPullRequest} label="Bracket" />
        </div>
      </nav>
    </div>
  );
};

export default MobileApp;
