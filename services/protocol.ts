
import { supabase } from '../supabase';
import { DirectiveType, Directive } from '../types';

/**
 * SOVEREIGN PROTOCOL SERVICE [V7.2]
 * Specialized in House Strategy deployment and Student Drill synchronization.
 */
export const ProtocolService = {
  /**
   * DEPLOY_STRATEGY / DEPLOY_DRILL
   * Pushes tactical sports directives to houses.
   */
  async deployDirective(
    adminId: string,
    type: DirectiveType,
    targetId: string,
    title: string,
    description: string
  ) {
    const { data, error } = await supabase
      .from('directives')
      .insert({
        type,
        target_id: targetId,
        details: { title, description },
        created_by: adminId,
        status: 'PENDING'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * SYNC_DIRECTIVE
   * Fetches the latest pending drill or strategy for the member's house.
   */
  async syncLatestDirective(houseId: string): Promise<Directive | null> {
    const { data, error } = await supabase
      .from('directives')
      .select('*')
      .eq('target_id', houseId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("SYNC_DIRECTIVE_FAULT:", error.message);
      return null;
    }
    return data;
  },

  /**
   * FETCH_TACTICAL_FEED
   * Retrieves the latest audit logs (comms) for global situational awareness.
   */
  async getTacticalFeed(limit = 10) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }
};
