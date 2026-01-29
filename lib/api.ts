import { supabase } from '../supabase';
import { LiveMatch } from '../types';

/**
 * SOVEREIGN API ENGINE [V10.0 - HARDENED]
 */
export const SovereignAPI = {
  async stageEvents(payloads: Partial<LiveMatch>[]) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert(payloads)
        .select();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error("API_UPLINK_TERMINATED:", error.message);
      return null;
    }
  },

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
      return null;
    }
  },

  async createEventForArm(payload: Partial<LiveMatch>, arm: SchoolArm) {
    try {
      const { data, error } = await supabase
        .from('matches')
        .insert({ ...payload, school_arm: arm })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err: any) {
      console.error("ARM_PROVISION_FAULT:", err.message);
      throw err;
    }
  },

  async createEventGlobal(payload: Partial<LiveMatch>) {
    try {
      // Standard async call - Removed Signal/AbortController
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