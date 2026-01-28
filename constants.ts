
import { SchoolArm, EventType, House, SportEvent, AdminUser, AdminRole, TournamentPhase } from './types';

export const SCORING_RULES = {
  // SINGLE PROTOCOL: Individual / Track / Field
  [EventType.SINGLE]: {
    1: 15,
    2: 12,
    3: 9,
    4: 6
  },
  // GROUP PROTOCOL: Team / Relays
  [EventType.GROUP]: {
    1: 25,
    2: 20,
    3: 15,
    4: 10
  },
  // VERSUS PROTOCOL: Bracket Logic
  [EventType.VERSUS]: {
    1: 30, // Winner of final
    2: 20, // Loser of final
    3: 15, // Winner of 3rd place
    4: 10  // Loser of 3rd place
  }
};

export interface HouseWithMascot extends House {
  mascot: string;
  motto: string;
}

export const HOUSES: HouseWithMascot[] = [
  { id: 'u1', name: 'Pinnacle Panthers', color: '#3B82F6', arm: SchoolArm.UPSS, mascot: 'Panther', motto: 'Pinnacle of Speed' },
  { id: 'u2', name: 'Victory Vikings', color: '#EF4444', arm: SchoolArm.UPSS, mascot: 'Viking', motto: 'Victory or Valhalla' },
  { id: 'u3', name: 'Harmony Hawks', color: '#EAB308', arm: SchoolArm.UPSS, mascot: 'Hawk', motto: 'Visionary Harmony' },
  { id: 'u4', name: 'Unity Unicorns', color: '#FFFFFF', arm: SchoolArm.UPSS, mascot: 'Unicorn', motto: 'One Spirit' },
  { id: 'c1', name: 'Pinnacle Panthers', color: '#3B82F6', arm: SchoolArm.CAM, mascot: 'Panther', motto: 'Pinnacle of Speed' },
  { id: 'c2', name: 'Victory Vikings', color: '#EF4444', arm: SchoolArm.CAM, mascot: 'Viking', motto: 'Victory or Valhalla' },
  { id: 'c3', name: 'Harmony Hawks', color: '#EAB308', arm: SchoolArm.CAM, mascot: 'Hawk', motto: 'Visionary Harmony' },
  { id: 'c4', name: 'Unity Unicorns', color: '#FFFFFF', arm: SchoolArm.CAM, mascot: 'Unicorn', motto: 'One Spirit' },
  { id: 'g1', name: 'Pinnacle Panthers', color: '#3B82F6', arm: SchoolArm.CAGS, mascot: 'Panther', motto: 'Pinnacle of Speed' },
  { id: 'g2', name: 'Victory Vikings', color: '#EF4444', arm: SchoolArm.CAGS, mascot: 'Viking', motto: 'Victory or Valhalla' },
  { id: 'g3', name: 'Harmony Hawks', color: '#EAB308', arm: SchoolArm.CAGS, mascot: 'Hawk', motto: 'Visionary Harmony' },
  { id: 'g4', name: 'Unity Unicorns', color: '#FFFFFF', arm: SchoolArm.CAGS, mascot: 'Unicorn', motto: 'One Spirit' },
];

export const MOCK_ADMINS: AdminUser[] = [
  { id: 'KING_001', name: 'Sovereign Architect', email: 'architect@sovereign.local', role: AdminRole.SUPER_KING },
  { id: 'UPSS_ADMIN_01', name: 'Coach Miller', email: 'miller@upss.local', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS },
  { id: 'CAM_ADMIN_01', name: 'Coach Sarah', email: 'sarah@cam.local', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAM },
  { id: 'CAGS_ADMIN_01', name: 'Coach Derek', email: 'derek@cags.local', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAGS },
  { id: 'MEM_001', name: 'Student Viewer', email: 'viewer@sovereign.local', role: AdminRole.MEMBER }
];

export const INITIAL_EVENTS: SportEvent[] = [
  { id: 'e1', name: '100m Dash (Senior)', type: EventType.SINGLE, arm: SchoolArm.UPSS, status: 'PENDING' },
  { 
    id: 'sf1', 
    name: 'Football: Semi-Final A', 
    type: EventType.VERSUS, 
    arm: SchoolArm.UPSS, 
    status: 'PENDING', 
    phase: TournamentPhase.SEMI_FINAL_A,
    participants: ['u1', 'u2'],
    tournamentId: 'football_upss_2024'
  },
  { 
    id: 'sf2', 
    name: 'Football: Semi-Final B', 
    type: EventType.VERSUS, 
    arm: SchoolArm.UPSS, 
    status: 'PENDING', 
    phase: TournamentPhase.SEMI_FINAL_B,
    participants: ['u3', 'u4'],
    tournamentId: 'football_upss_2024'
  },
  { 
    id: 'tp1', 
    name: 'Football: 3rd Place Playoff', 
    type: EventType.VERSUS, 
    arm: SchoolArm.UPSS, 
    status: 'PENDING', 
    phase: TournamentPhase.THIRD_PLACE,
    participants: [], 
    tournamentId: 'football_upss_2024'
  },
  { 
    id: 'final', 
    name: 'Football: Grand Final', 
    type: EventType.VERSUS, 
    arm: SchoolArm.UPSS, 
    status: 'PENDING', 
    phase: TournamentPhase.FINAL,
    participants: [], 
    tournamentId: 'football_upss_2024'
  },
  { id: 'e5', name: 'Shot Put Finals', type: EventType.SINGLE, arm: SchoolArm.CAM, status: 'PENDING' },
];
