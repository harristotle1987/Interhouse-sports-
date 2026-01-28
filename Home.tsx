import React, { useState } from 'react';
import LoginModal from './LoginModal';
import { useSovereignStore } from './store';
import { User, Shield, ChevronRight, Trophy, Zap, Target } from 'lucide-react';
import { HOUSES } from './constants';

const Home: React.FC = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const user = useSovereignStore((state) => state.user);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-800">
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {!isLoginOpen && !user && (
        <nav className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-md shadow-indigo-200">
              <Shield size={20} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Sovereign<span className="text-slate-400">Architect</span></span>
          </div>
          <button 
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-full font-medium text-sm hover:bg-indigo-600 transition-colors shadow-lg shadow-slate-200"
          >
            <User size={16} />
            <span>Operative Login</span>
          </button>
        </nav>
      )}

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-24 animate-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold uppercase tracking-widest mb-8">
              <Zap size={12} />
              Inter-house Telemetry System v3.0
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.95] mb-8">
              RECLAIM<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">THE GLORY</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              The absolute standard in academic athletics. Precision scoring, real-time analytics, and automated tournament management for the modern era.
            </p>

            <div className="flex justify-center gap-6">
              <button 
                onClick={() => setIsLoginOpen(true)}
                className="group flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-full font-bold text-lg hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 transition-all hover:-translate-y-1"
              >
                Enter Portal
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-slate-600 border border-slate-200 rounded-full font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
                View Documentation
              </button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {[
              { title: 'Real-time Scoring', desc: 'Live updates from the field directly to the cloud ledger.', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
              { title: 'Tournament Logic', desc: 'Automated bracket progression and knockout tracking.', icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              { title: 'Auditable Data', desc: 'Full transparency with immutable admin logs.', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* House Ticker */}
          <div className="border-t border-slate-200 pt-16">
            <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-12">Participating Houses</p>
            <div className="flex flex-wrap justify-center gap-12 opacity-80">
              {HOUSES.slice(0, 4).map((house) => (
                <div key={house.id} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: house.color }}></div>
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-sm">{house.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 text-center">
        <p className="text-slate-400 text-sm font-medium">© 2026 Sovereign Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;