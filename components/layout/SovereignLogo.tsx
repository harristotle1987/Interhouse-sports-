import React from 'react';

/**
 * SOVEREIGN INSIGNIA [V8.0 - OBSIDIAN HIGH-CONTRAST]
 * Purpose: Branding for Architect-level interfaces.
 * Palette: Obsidian (#000000) | Stark White (#FFFFFF) | Indigo (#4F46E5)
 */
const SovereignLogo: React.FC<{ size?: number, color?: string, withText?: boolean }> = ({ 
  size = 32, 
  color = "white", 
  withText = true 
}) => (
  <div className="flex items-center gap-5 group cursor-pointer transition-all">
    {/* Obsidian Node Icon */}
    <div className="p-3 bg-black border border-white/10 rounded-[1.25rem] shadow-[0_0_40px_rgba(0,0,0,1)] group-hover:bg-indigo-600 group-hover:border-indigo-400 transition-all duration-700 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className="drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] relative z-10"
      >
        {/* Reinforced Obsidian Shield */}
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <circle cx="12" cy="12" r="3" fill={color} fillOpacity="0.15" />
        <path d="M12 9v6" className="group-hover:stroke-emerald-400 transition-colors" />
        <path d="M9 12h6" className="group-hover:stroke-emerald-400 transition-colors" />
      </svg>
    </div>
    
    {withText && (
      <div className="flex flex-col text-left">
        <span className="font-black text-3xl tracking-tighter uppercase italic leading-none text-white group-hover:text-indigo-400 transition-all duration-500">
          Sovereign<span className="text-zinc-600 group-hover:text-emerald-500 transition-colors">Architect</span>
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.5em] text-zinc-700 italic mt-2 leading-none group-hover:text-white transition-colors">
          Obsidian Identity Protocol
        </span>
      </div>
    )}
  </div>
);

export default SovereignLogo;