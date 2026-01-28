import React from 'react';
import { useSovereignStore } from './store';
import { AdminRole, SchoolArm } from './types';
import { useAuth } from './context/AuthContext';
import { 
  LogOut, 
  Terminal, 
  LayoutDashboard, 
  ShieldCheck,
  Crown
} from 'lucide-react';

interface SovereignNavProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
}

/**
 * SOVEREIGN NAVIGATION: OBSIDIAN UTILITY BAR
 * Fixed bottom-8 architecture for persistent session control.
 * High-contrast "Exit Bunker" protocol for secure termination.
 */
const SovereignNav: React.FC<SovereignNavProps> = ({ activeTab, setActiveTab }) => {
  const { user, currentRole } = useSovereignStore();
  const { logout } = useAuth(); // Use the new high-speed logout hook

  if (!user) return null;

  return (
    <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-2xl px-4 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/10 rounded-full px-6 py-4 flex justify-between items-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        
        {/* Role & Sector Telemetry */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {currentRole === AdminRole.SUPER_KING ? (
              <Crown size={12} className="text-emerald-500" />
            ) : (
              <ShieldCheck size={12} className="text-emerald-500" />
            )}
            <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest leading-none">
              {currentRole?.replace('_', ' ')}
            </span>
          </div>
          <span className="text-[9px] text-zinc-500 font-mono uppercase italic tracking-widest mt-1">
            {user.arm || SchoolArm.GLOBAL} NODE
          </span>
        </div>

        {/* Tactical Actions */}
        <div className="flex gap-6 items-center">
          <button 
            onClick={() => setActiveTab('home')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'home' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Feed</span>
          </button>

          {(currentRole === AdminRole.SUB_ADMIN || currentRole === AdminRole.SUPER_KING) && (
            <button 
              onClick={() => setActiveTab('create')}
              className={`text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center gap-2 ${activeTab === 'create' ? 'text-emerald-400' : 'text-zinc-500 hover:text-emerald-400'}`}
            >
              <Terminal size={14} />
              <span className="hidden sm:inline">Tactical Console</span>
            </button>
          )}

          {/* High-Contrast Exit Protocol */}
          <button 
            onClick={logout}
            className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/5 flex items-center gap-2"
          >
            <LogOut size={14} />
            Exit Bunker
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SovereignNav;
