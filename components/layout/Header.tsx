import React from 'react';
import { Menu } from 'lucide-react';
import { useSovereignStore } from '../../store';

interface HeaderProps {
  onMenuClick: () => void;
}

/**
 * SOVEREIGN UNIVERSAL HEADER [V1.0]
 * Integrates the SVG insignia and provides a responsive layout
 * with a hamburger menu control for mobile viewports.
 */
const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useSovereignStore();

  const SovereignLogo = () => (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="white" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-5 h-5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      </div>
      <span className="font-bold text-lg tracking-tight text-slate-900">Sovereign<span className="text-slate-400">Architect</span></span>
    </div>
  );
  
  return (
    <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-10 shadow-sm z-10">
      <div className="lg:hidden">
        <button onClick={onMenuClick} className="p-3 text-slate-500 hover:bg-slate-100 rounded-2xl transition-colors">
          <Menu size={24} />
        </button>
      </div>
      
      <div className="hidden lg:flex">
        <SovereignLogo />
      </div>

      <div className="flex items-center gap-4 group cursor-default">
        <div className="text-right hidden sm:block space-y-0.5">
          <p className="text-[11px] font-black text-slate-900 leading-none uppercase italic">{user?.name || 'Operative'}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user?.arm || 'Global'} Sector</p>
        </div>
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-black border-2 border-white shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all text-sm">
          {user?.name?.charAt(0) || 'S'}
        </div>
      </div>
    </header>
  );
};

export default Header;
