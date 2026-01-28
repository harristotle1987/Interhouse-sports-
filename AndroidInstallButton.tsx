
import React from 'react';
import { DownloadCloud, Shield } from 'lucide-react';

interface AndroidInstallButtonProps {
  isVisible: boolean;
  onInstall: () => void;
}

const AndroidInstallButton: React.FC<AndroidInstallButtonProps> = ({ isVisible, onInstall }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-md animate-in slide-in-from-bottom-10 duration-500">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full p-4 flex items-center justify-between shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-600 rounded-full">
            <Shield size={20} className="text-white" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold text-white leading-tight">Install Sovereign App</h4>
            <p className="text-xs text-zinc-400 leading-tight">Get the full-screen experience.</p>
          </div>
        </div>
        <button 
          onClick={onInstall}
          className="bg-emerald-500 text-black font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-colors"
        >
          <DownloadCloud size={16} />
          Install
        </button>
      </div>
    </div>
  );
};

export default AndroidInstallButton;
