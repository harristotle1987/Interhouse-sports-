
import { useCallback } from 'react';
import { supabase } from '../supabase';
import { useSovereignStore } from '../store';
import { useAdminAuth } from '../useAdminAuth';
import { AdminUser } from '../types';

/**
 * SOVEREIGN AUTH CONTEXT [V2.0 - HIGH SPEED]
 * Optimized for instant session termination and hard environment resets.
 */
export const useAuth = () => {
  const { user, setUser, clearSession: clearStoreSession } = useSovereignStore();
  const { login: performSupabaseLogin, isLoading, error } = useAdminAuth();

  /**
   * RAPID EXIT PROTOCOL
   * Forces a hard cache reset and redirect to solve loading lag.
   */
  const logout = useCallback(async () => {
    console.log("SOVEREIGN_PROTOCOL: Triggering high-speed environment purge...");
    
    // 1. Terminate remote uplink
    await supabase.auth.signOut();
    
    // 2. Clear application memory
    clearStoreSession();
    
    // 3. HARD PURGE: Clear local persistent caches
    localStorage.clear();
    sessionStorage.clear();
    
    // 4. INSTANT REDIRECT: Bypass router for clean state
    window.location.replace('/');
  }, [clearStoreSession]);

  /**
   * IDENTITY UPLINK
   */
  const login = useCallback(async (email: string, password: string) => {
    const mockUser = useSovereignStore.getState().mockUsers.find(
      u => u.email?.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );

    if (mockUser) {
      setUser(mockUser);
      return true;
    }

    const result = await performSupabaseLogin(email, password);
    if (result) {
      const userPayload: AdminUser = {
        id: result.user.id,
        name: result.user.user_metadata?.full_name || email.split('@')[0],
        email: result.user.email!,
        role: result.role,
        arm: result.arm
      };
      setUser(userPayload);
      return true;
    }
    return false;
  }, [performSupabaseLogin, setUser]);

  return {
    user,
    isLoading,
    error,
    login,
    logout
  };
};
