import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string;
  auraScore?: number;
  dateOfBirth?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  token: string | null;
  user: UserProfile | null;

  // Actions
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  completeOnboarding: () => void;
  setUser: (user: Partial<UserProfile>) => void;
  toggleDemoAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isOnboarded: false,
  token: null,
  user: null,

  login: (token, user) =>
    set({
      isAuthenticated: true,
      isOnboarded: true,
      token,
      user,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      isOnboarded: false,
      token: null,
      user: null,
    }),

  completeOnboarding: () =>
    set((state) => ({
      isOnboarded: true,
      isAuthenticated: true,
      user: state.user || {
        id: 'usr-demo-1',
        email: 'user@moodspace.app',
        displayName: 'Demo Soul',
        auraScore: 120,
      },
    })),

  setUser: (updated) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : null,
    })),

  toggleDemoAuth: () =>
    set((state) => {
      const nextAuth = !state.isAuthenticated;
      return {
        isAuthenticated: nextAuth,
        isOnboarded: nextAuth,
        token: nextAuth ? 'mock-jwt-token' : null,
        user: nextAuth
          ? {
              id: 'usr-demo-1',
              email: 'explorer@moodspace.app',
              displayName: 'Aura Explorer',
              auraScore: 450,
            }
          : null,
      };
    }),
}));
