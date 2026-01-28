
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminRole, AdminUser, SchoolArm, SportEvent, LiveMatch, ScoreEntry } from './types';

interface MockOperative extends AdminUser {
  password?: string;
}

interface SovereignState {
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: AdminUser | null;
  currentRole: AdminRole | null;
  activeArm: SchoolArm;
  isImpersonating: boolean;
  mockUsers: MockOperative[];
  
  // OFFLINE STORAGE PROTOCOL
  localEvents: LiveMatch[];
  localResults: ScoreEntry[];

  setUser: (user: AdminUser | null) => void;
  setCurrentRole: (role: AdminRole | null) => void;
  setActiveArm: (arm: SchoolArm) => void;
  addMockUser: (user: MockOperative) => void;
  
  // LOCAL ACTIONS
  addLocalEvent: (event: LiveMatch) => void;
  updateLocalEvent: (id: string, updates: Partial<LiveMatch>) => void;
  addLocalResult: (result: ScoreEntry) => void;
  
  clearSession: () => void;
}

// GENERATOR: Helper to create the 24 house members (8 per school, 2 per house)
// DOMAIN PROTOCOL: [house].[id]@sovereign.[sector_tld]
const generateMembers = (): MockOperative[] => {
  const members: MockOperative[] = [];
  const arms = [SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS];
  const houses = ['Panther', 'Viking', 'Hawk', 'Unicorn'];
  
  let idCounter = 1;

  arms.forEach(arm => {
    houses.forEach(house => {
      // 2 members per house = 8 per school
      for (let i = 1; i <= 2; i++) {
        const sectorTLD = arm.toLowerCase(); // upss, cam, cags
        const email = `${house.toLowerCase()}.${i}@sovereign.${sectorTLD}`;
        
        members.push({
          id: `mem-${idCounter++}`,
          name: `${arm} ${house} Recruit ${i}`,
          email: email,
          role: AdminRole.MEMBER,
          arm: arm,
          password: 'admin'
        });
      }
    });
  });

  return members;
};

// GENERATOR: Helper to create 15 Administrative Heads (5 per school)
// DOMAIN PROTOCOL: head.[id]@sovereign.[sector_tld]
const generateAdminHeads = (): MockOperative[] => {
    const heads: MockOperative[] = [];
    const arms = [SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS];
    let idCounter = 100;

    arms.forEach(arm => {
        const sectorTLD = arm.toLowerCase();
        for(let i = 1; i <= 5; i++) {
             heads.push({
                id: `head-${idCounter++}`,
                name: `${arm} Dept Head ${i}`,
                email: `head.${i}@sovereign.${sectorTLD}`,
                role: AdminRole.MEMBER, // Administrative heads have viewer access
                arm: arm,
                password: 'admin'
            });
        }
    });
    return heads;
}

export const useSovereignStore = create<SovereignState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      user: null,
      currentRole: null,
      activeArm: SchoolArm.GLOBAL,
      isImpersonating: false,
      mockUsers: [
        // --- 1. HIGH COMMAND (2 SUPER ADMINS) ---
        { id: 'sa-01', name: 'Sovereign Architect', email: 'architect@sovereign.global', role: AdminRole.SUPER_KING, arm: SchoolArm.GLOBAL, password: 'admin' },
        { id: 'sa-02', name: 'High Overseer', email: 'overseer@sovereign.upss', role: AdminRole.SUPER_KING, arm: SchoolArm.UPSS, password: 'admin' },

        // --- 2. UPSS SECTOR COMMAND (5 SUB-ADMINS) ---
        { id: 'upss-dir', name: 'UPSS Director', email: 'director@sovereign.upss', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS, password: 'admin' },
        { id: 'upss-log', name: 'UPSS Logistics', email: 'logistics@sovereign.upss', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS, password: 'admin' },
        { id: 'upss-trk', name: 'UPSS Track Lead', email: 'track.lead@sovereign.upss', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS, password: 'admin' },
        { id: 'upss-fld', name: 'UPSS Field Lead', email: 'field.lead@sovereign.upss', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS, password: 'admin' },
        { id: 'upss-rec', name: 'UPSS Records', email: 'records@sovereign.upss', role: AdminRole.SUB_ADMIN, arm: SchoolArm.UPSS, password: 'admin' },

        // --- 3. CAM SECTOR COMMAND (2 SUB-ADMINS) ---
        { id: 'cam-dir', name: 'CAM Director', email: 'director@sovereign.cam', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAM, password: 'admin' },
        { id: 'cam-log', name: 'CAM Logistics', email: 'logistics@sovereign.cam', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAM, password: 'admin' },

        // --- 4. CAGS SECTOR COMMAND (2 SUB-ADMINS) ---
        { id: 'cags-dir', name: 'CAGS Director', email: 'director@sovereign.cags', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAGS, password: 'admin' },
        { id: 'cags-log', name: 'CAGS Logistics', email: 'logistics@sovereign.cags', role: AdminRole.SUB_ADMIN, arm: SchoolArm.CAGS, password: 'admin' },

        // --- 5. FIELD OPERATIVES (24 MEMBERS) ---
        ...generateMembers(),

        // --- 6. ADMINISTRATIVE HEADS (15 MEMBERS) ---
        ...generateAdminHeads()
      ],
      
      localEvents: [],
      localResults: [],

      setUser: (user) => {
        // PERFORMANCE GUARD: Prevent redundant updates
        const currentUser = get().user;
        if (JSON.stringify(currentUser) === JSON.stringify(user)) return;
        
        set({ 
          user, 
          currentRole: user?.role || null,
          isImpersonating: false 
        });
      },
      setCurrentRole: (role) => {
        const user = get().user;
        set({ 
          currentRole: role,
          isImpersonating: user ? user.role !== role : false
        });
      },
      setActiveArm: (arm) => set({ activeArm: arm }),
      addMockUser: (newUser) => set((state) => {
        const filtered = state.mockUsers.filter(u => u.email !== newUser.email);
        return { mockUsers: [...filtered, newUser] };
      }),
      
      // LOCAL ACTIONS
      addLocalEvent: (event) => set((state) => ({ localEvents: [event, ...state.localEvents] })),
      updateLocalEvent: (id, updates) => set((state) => ({
        localEvents: state.localEvents.map(e => e.id === id ? { ...e, ...updates } : e)
      })),
      addLocalResult: (result) => set((state) => ({ localResults: [result, ...state.localResults] })),

      clearSession: () => set({ 
        user: null, 
        currentRole: null, 
        isImpersonating: false,
        activeArm: SchoolArm.GLOBAL
      }),
    }),
    {
      name: 'sovereign-vault-session',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
