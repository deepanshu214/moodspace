import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '@/utils/storage';

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
  isInitializing: boolean;
  token: string | null;
  user: UserProfile | null;

  // Actions
  loadStoredSession: () => Promise<void>;
  login: (token: string, user: UserProfile) => Promise<void>;
  logout: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setUser: (user: Partial<UserProfile>) => Promise<void>;
  toggleDemoAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isOnboarded: false,
  isInitializing: true,
  token: null,
  user: null,

  loadStoredSession: async () => {
    try {
      const token = await storage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userJson = await storage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (token && userJson) {
        const user = JSON.parse(userJson);
        set({
          isAuthenticated: true,
          isOnboarded: true,
          token,
          user,
          isInitializing: false,
        });
        return;
      }
    } catch {
      // Failed to load, default to unauthenticated
    }
    set({ isInitializing: false });
  },

  login: async (token, user) => {
    try {
      await storage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
    } catch {}
    set({
      isAuthenticated: true,
      isOnboarded: true,
      token,
      user,
    });
  },

  logout: async () => {
    try {
      await storage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      await storage.removeItem(STORAGE_KEYS.USER_PROFILE);
    } catch {}
    set({
      isAuthenticated: false,
      isOnboarded: false,
      token: null,
      user: null,
    });
  },

  completeOnboarding: async () => {
    const currentUser = get().user || {
      id: 'usr-demo-1',
      email: 'user@moodspace.app',
      displayName: 'Demo Soul',
      auraScore: 120,
    };
    try {
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(currentUser));
    } catch {}
    set({
      isOnboarded: true,
      isAuthenticated: true,
      user: currentUser,
    });
  },

  setUser: async (updated) => {
    const current = get().user;
    if (!current) return;
    const merged = { ...current, ...updated };
    try {
      await storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(merged));
    } catch {}
    set({ user: merged });
  },

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
