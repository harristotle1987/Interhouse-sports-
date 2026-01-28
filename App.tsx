import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';
import { AdminRole, SchoolArm } from './types';
import { useSovereignStore } from './store';
import SovereignRouter from './SovereignRouter';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { setUser, clearSession } = useSovereignStore();
  const [authLoading, setAuthLoading] = useState(true);
  const initialized = useRef(false);

  const fetchProfile = useCallback(async (sessionUser: User) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', sessionUser.id).single();
      
      const roleMap: Record<string, AdminRole> = { 
        'super_admin': AdminRole.SUPER_KING, 
        'super_king': AdminRole.SUPER_KING, 
        'sub_admin': AdminRole.SUB_ADMIN, 
        'member': AdminRole.MEMBER 
      };
      
      const metadata = sessionUser.user_metadata || {};
      const metaRole = (metadata.role || 'member').toLowerCase();
      
      const resolvedRole = roleMap[data?.role?.toLowerCase() || metaRole] || AdminRole.MEMBER;
      const resolvedArm = (data?.school_arm || metadata.school_arm || 'GLOBAL').toUpperCase() as SchoolArm;

      setUser({ 
        id: sessionUser.id, 
        name: data?.full_name || metadata.full_name || 'Operative', 
        email: sessionUser.email || '', 
        role: resolvedRole, 
        arm: resolvedArm 
      });
    } catch (e) {
      console.error("GATE_FAULT", e);
      clearSession();
    }
  }, [setUser, clearSession]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    
    setAuthLoading(true);
    
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await fetchProfile(session.user);
      }
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setAuthLoading(true);
        await fetchProfile(session.user);
        setAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        clearSession();
        setAuthLoading(false);
        if (window.location.pathname !== '/') {
            window.location.replace('/');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, clearSession]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden font-sans">
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] opacity-80"></div>
         <div className="relative z-10 flex flex-col items-center gap-12 animate-in fade-in zoom-in duration-1000">
            <div className="p-8 bg-black border border-white/10 rounded-[2.5rem] shadow-[0_0_100px_rgba(255,255,255,0.05)]">
               <svg 
                  width="80" 
                  height="80" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
               >
                 <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                 <circle cx="12" cy="12" r="3" fill="white" fillOpacity="0.2" />
               </svg>
            </div>
            <div className="text-center space-y-6">
               <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Sovereign<span className="text-zinc-800">Bunker</span></h2>
               <div className="flex items-center gap-3 justify-center">
                 <Loader2 className="animate-spin text-white/40" size={20} />
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em] italic">Accessing Node...</span>
               </div>
            </div>
         </div>
      </div>
    );
  }

  return <SovereignRouter />;
};

export default App;