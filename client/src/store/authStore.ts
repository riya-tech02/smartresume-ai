import { create } from 'zustand';
import type { User } from '@smartresume/shared';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isInitializing: boolean;
  setAuth: (accessToken: string, user?: User) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
  setInitializing: (isInitializing: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitializing: true,
  setAuth: (accessToken, user) =>
    set((state) => ({
      accessToken,
      user: user || state.user,
      isInitializing: false,
    })),
  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, accessToken: null, isInitializing: false }),
  setInitializing: (isInitializing) => set({ isInitializing }),
}));
