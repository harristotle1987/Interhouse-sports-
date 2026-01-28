import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { useTacticalData } from './useTacticalData';

interface Operative {
  id: string;
  full_name: string;
  email: string;
  username: string;
  admin_display_id: string;
  role: string;
  school_arm: string;
  created_at: string;
}

/**
 * SOVEREIGN LEDGER HOOK [V6.1]
 * Centralizes operative data fetching with Node-Based Filtering.
 */
export const useOperativeLedger = () => {
  const [operatives, setOperatives] = useState<Operative[]>([]);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const { arm, isSuper } = useTacticalData();

  const fetchLedger = useCallback(async () => {
    try {
      if (isMounted.current) setLoading(true);
      
      // SOVEREIGN FILTER: Enforce sector lockdown unless Super Admin
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!isSuper) {
        query = query.eq('school_arm', arm);
      }

      const { data, error } = await query;
      
      if (!isMounted.current) return;

      if (data) {
        setOperatives(data);
      } else if (error) {
        console.error("LEDGER_SYNC_ERROR:", error.message);
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [arm, isSuper]);

  useEffect(() => {
    isMounted.current = true;
    fetchLedger();

    const instanceId = Math.random().toString(36).substring(2, 9);
    const channelName = `profiles-ledger-sync-${instanceId}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => {
          if (isMounted.current) {
            fetchLedger();
          }
        }
      )
      .subscribe();

    return () => {
      isMounted.current = false;
      supabase.removeChannel(channel);
    };
  }, [fetchLedger]);

  return { operatives, loading, refetch: fetchLedger };
};