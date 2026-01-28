import { supabase } from '../supabase';
import { LiveMatch } from '../types';

/**
 * SOVEREIGN API ENGINE [V9.0 - HARDENED]
 * Fix: Neutralized AbortController signals to stop "SIGNAL IS ABORTED" crashes.
 * Logic: Direct async/await execution for the 21 biennial championship events.
 */
export const SovereignAPI = {
  /**
   * HIGH-RELIABILITY STAGING
   * Provisions event nodes with absolute transaction acknowledgement.
   */
  async stageEvents(payloads: Partial<LiveMatch>[]) {
    console.log(`SOVEREIGN_API: Syncing ${payloads.length} biennial events...`);
    
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert(payloads)
        .select();

      if (error) {
        console.error("UPLINK_WRITE_FAULT:", error.message);
        throw new Error(`CRITICAL_API_FAULT: ${error.message}`);
      }

      console.log("SOVEREIGN_API: Staging acknowledgement successful.");
      return data;
    } catch (error: any) {
      console.error("API_UPLINK_TERMINATED:", error.message);
      return null;
    }
  },

  /**
   * ATOMIC TELEMETRY SYNC
   */
  async updateTelemetry(id: string, updates: Partial<LiveMatch>) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      console.warn(`TELEMETRY_SYNC_FAILURE: ${id} - ${err.message}`);
      return null;
    }
  },

  /**
   * GLOBAL PROVISIONING (SUPER ADMIN)
   * Bypasses sector constraints via Nexus administrative override.
   */
  async createEventGlobal(payload: Partial<LiveMatch>) {
    try {
      // Standard async call - NO Signal/AbortController
      const { data, error } = await supabase
        .from('matches')
        .insert(payload)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("GLOBAL_PROVISION_FAULT:", err.message);
      throw err;
    }
  }
};