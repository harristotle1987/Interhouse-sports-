
import React from 'react';
import { X, ArrowUpSquare, PlusSquare, Shield } from 'lucide-react';

interface IOSInstallPromptProps {
  isOpen: boolean;
  onClose: () => void;
}

const IOSInstallPrompt: React.FC<IOSInstallPromptProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:p-6 pb-16">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500" 
        onClick={onClose} 
      />
      <div className="relative bg-[#0a0a0a] border border-zinc-800 text-white rounded-[2.5rem] w-full max-w-md p-8 shadow-[0_0_80px_rgba(79,70,229,0.3)] animate-in slide-in-from-bottom-10 duration-500 text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
            <Shield size={32} className="text-indigo-400" />
          </div>
        </div>
        
        <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-4">Install Sovereign</h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          For a full-screen, native experience, add this app to your Home Screen.
        </p>
        
        <div className="flex items-center justify-center gap-6 text-zinc-400">
           <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest">1. Tap Share</span>
              <ArrowUpSquare size={40} className="text-indigo-500" />
           </div>
           <div className="text-2xl font-thin text-zinc-800">→</div>
           <div className="flex flex-col items-center gap-2">
             <span className="text-xs font-bold uppercase tracking-widest">2. Add to Home Screen</span>
             <PlusSquare size={40} className="text-indigo-500" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;
