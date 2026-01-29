
import { useState } from 'react';
import { supabase } from './supabase';
import { AdminRole, SchoolArm } from './types';

export const useAdminAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (emailInput: string, password: string) => {
    setIsLoading(true);
    setError(null);

    const email = emailInput.trim().toLowerCase();

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData?.user) throw new Error("IDENTITY_REJECTED");

      const metadata = authData.user.user_metadata || {};
      
      // SOVEREIGN REDIRECT MATRIX [V9.5]
      const roleMap: Record<string, AdminRole> = {
        'super_king': AdminRole.SUPER_KING,
        'super_admin': AdminRole.SUPER_KING,
        'sub_admin': AdminRole.SUB_ADMIN,
        'member': AdminRole.MEMBER
      };

      const rawRole = (metadata.role || '').toLowerCase();
      if (!rawRole) {
          await supabase.auth.signOut();
          throw new Error("UNAUTHORIZED_ACCESS: ROLE_MISSING");
      }

      const finalRole = roleMap[rawRole] || AdminRole.MEMBER;
      const finalArm = (metadata.school_arm || 'GLOBAL').toUpperCase() as SchoolArm;

      // Determine tactical destination
      let targetPath = '/spectator/view';
      if (finalRole === AdminRole.SUPER_KING) targetPath = '/admin/console';
      else if (finalRole === AdminRole.SUB_ADMIN) targetPath = '/official/tactical';

      return {
        user: authData.user,
        role: finalRole,
        arm: finalArm,
        targetPath
      };
      
    } catch (err: any) {
      setError(err.message?.toUpperCase() || "AUTH_FAILURE");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading, error };
};
