
export enum SchoolArm {
  UPSS = 'UPSS',
  CAM = 'CAM',
  CAGS = 'CAGS',
  GLOBAL = 'GLOBAL'
}

export enum EventType {
  SINGLE = 'SINGLE',
  GROUP = 'GROUP',
  VERSUS = 'VERSUS'
}

export enum EventCategory {
  Track = 'Track',
  Field = 'Field',
  Team = 'Team',
  Individual_Sport = 'Individual_Sport'
}

export enum ScoringType {
  Group_Marks = 'Group_Marks',
  Single_Marks = 'Single_Marks',
  Manual_Override = 'Manual_Override'
}

export enum MatchType {
  Single = 'Single',
  Track = 'Track',
  Field = 'Field',
  Team = 'Team'
}

export enum TournamentPhase {
  SEMI_FINAL_A = 'SEMI_FINAL_A',
  SEMI_FINAL_B = 'SEMI_FINAL_B',
  THIRD_PLACE = 'THIRD_PLACE',
  FINAL = 'FINAL'
}

export enum AdminRole {
  SUPER_KING = 'SUPER_KING',
  SUB_ADMIN = 'SUB_ADMIN',
  MEMBER = 'MEMBER'
}

export enum DirectiveType {
  DRILL = 'DRILL',
  STRATEGY = 'STRATEGY'
}

export interface House {
  id: string;
  name: string;
  color: string;
  arm: SchoolArm;
}

export interface Standing {
  house_id: string;
  house_name: string;
  school_arm: SchoolArm;
  color: string;
  gold_medals: number;
  silver_medals: number;
  bronze_medals: number;
  fourth_place: number;
  total_points: number;
  global_rank: number;
}

export interface SportEvent {
  id: string;
  name: string;
  type: EventType;
  arm: SchoolArm;
  status: 'PENDING' | 'LIVE' | 'COMPLETED';
  isVersus?: boolean;
  phase?: TournamentPhase;
  participants?: string[]; // House IDs
  winnerId?: string;
  loserId?: string;
  tournamentId?: string; 
}

export interface LiveMatch {
  id: string;
  event_name: string;
  description?: string;
  status: 'scheduled' | 'live' | 'paused' | 'finished' | 'cancelled';
  school_arm: SchoolArm;
  event_type: EventCategory;
  scoring_logic: ScoringType;
  house_a?: string;
  house_b?: string;
  score_a: number;
  score_b: number;
  kickoff_at: string | null; 
  started_at?: string | null;
  match_type: MatchType | string;
  duration_minutes: number;
  created_at?: string;
  version: number;
  current_official_id?: string;
  current_official_name?: string;
  winning_house_id?: string;
  sealed_at?: string;
  sealed_by?: string;
  is_manual_override?: boolean;
  manual_score?: number;
  metadata: {
    scores: Record<string, number>;
    participants: string[];
    elapsed_ms?: number;
  };
}

export interface NexusEvent extends LiveMatch {
  match_id: string;
  official_name: string;
  official_id: string;
  scoring_scale: string;
}

export interface BacklogEvent {
  match_id: string;
  event_name: string;
  event_type: EventCategory;
  scoring_logic: ScoringType;
  school_arm: SchoolArm;
  position: number;
  house_name: string;
  house_color: string;
  points_contributed: number;
  completion_timestamp: string;
  officiating_admin: string;
}

export interface EventResult {
  match_id: string;
  house_id: string;
  position: number;
  points_awarded: number;
}

export interface ScoreEntry {
  id: string;
  eventId: string;
  houseId: string;
  position: number;
  points: number;
  adminId: string;
  timestamp: number;
  sector: string;
  event_name: string;
  house_id: string;
}

export interface Directive {
  id: string;
  type: DirectiveType;
  target_id: string;
  details: {
    title: string;
    description: string;
    metrics?: Record<string, any>;
  };
  status: 'PENDING' | 'COMPLETED';
  created_by: string;
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  username?: string;
  role: AdminRole;
  arm?: SchoolArm;
}