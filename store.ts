import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AdminRole, AdminUser, SchoolArm, LiveMatch, ScoreEntry } from './types';

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
  
  localEvents: LiveMatch[];
  localResults: ScoreEntry[];

  setUser: (user: AdminUser | null) => void;
  setCurrentRole: (role: AdminRole | null) => void;
  setActiveArm: (arm: SchoolArm) => void;
  addMockUser: (user: MockOperative) => void;
  
  addLocalEvent: (event: LiveMatch) => void;
  updateLocalEvent: (id: string, updates: Partial<LiveMatch>) => void;
  addLocalResult: (result: ScoreEntry) => void;
  
  clearSession: () => void;
}

const generateMembers = (): MockOperative[] => {
  const members: MockOperative[] = [];
  const arms = [SchoolArm.UPSS, SchoolArm.CAM, SchoolArm.CAGS];
  const houses = ['Panther', 'Viking', 'Hawk', 'Unicorn'];
  let idCounter = 1;
  arms.forEach(arm => {
    houses.forEach(house => {
      for (let i = 1; i <= 2; i++) {
        members.push({
          id: `mem-${idCounter++}`,
          name: `${arm} ${house} Recruit ${i}`,
          email: `${house.toLowerCase()}.${i}@sovereign.${arm.toLowerCase()}`,
          role: AdminRole.MEMBER,
          arm: arm,
          password: 'admin'
        });
      }
    });
  });
  return members;
};

/**
 * SOVEREIGN STATE STORE [V10.1 - MODERN ZUSTAND]
 * Uses named imports to eliminate deprecation warnings and enhance high-speed Obsidian UI.
 */
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
        { id: 'sa-01', name: 'Sovereign Architect', email: 'architect@sovereign.global', role: AdminRole.SUPER_KING, arm: SchoolArm.GLOBAL, password: 'admin' },
        ...generateMembers()
      ],
      localEvents: [],
      localResults: [],
      setUser: (user) => set({ user, currentRole: user?.role || null, isImpersonating: false }),
      setCurrentRole: (role) => {
        const user = get().user;
        set({ currentRole: role, isImpersonating: user ? user.role !== role : false });
      },
      setActiveArm: (arm) => set({ activeArm: arm }),
      addMockUser: (newUser) => set((state) => {
        const filtered = state.mockUsers.filter(u => u.email !== newUser.email);
        return { mockUsers: [...filtered, newUser] };
      }),
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
