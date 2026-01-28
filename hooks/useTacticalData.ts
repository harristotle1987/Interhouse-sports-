import { useMemo } from 'react';
import { useSovereignStore } from '../store';
import { SchoolArm, AdminRole } from '../types';

/**
 * SOVEREIGN TACTICAL DATA FETCHER
 * Purpose: Identifies current operative's sector and provides filtering parameters.
 */
export const useTacticalData = () => {
  const { user, currentRole } = useSovereignStore();

  const tacticalMeta = useMemo(() => {
    // Force strict Arm check
    const arm = user?.arm || SchoolArm.GLOBAL;
    const isSuper = currentRole === AdminRole.SUPER_KING;
    const isOfficial = currentRole === AdminRole.SUB_ADMIN;
    
    // Resolve dynamic path based on arm (e.g., /official/tactical/upss)
    const tacticalPath = arm !== SchoolArm.GLOBAL 
      ? `/official/tactical/${arm.toLowerCase()}` 
      : '/official/tactical';

    return {
      arm,
      isSuper,
      isOfficial,
      tacticalPath,
      // Sovereign Filter Object for Supabase .match() or .eq()
      nodeFilter: isSuper ? {} : { school_arm: arm }
    };
  }, [user, currentRole]);

  return tacticalMeta;
};