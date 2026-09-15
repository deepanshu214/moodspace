import { create } from 'zustand';
import { Platform } from 'react-native';

export interface NetworkStoreState {
  isOnline: boolean;
  isInternetReachable: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: string | null;
  setOnline: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setPendingCount: (count: number) => void;
  setLastSyncTime: (time: string) => void;
  checkConnectivity: () => Promise<boolean>;
}

export const useNetworkStore = create<NetworkStoreState>((set, get) => ({
  isOnline: true,
  isInternetReachable: true,
  isSyncing: false,
  pendingCount: 0,
  lastSyncTime: null,

  setOnline: (isOnline: boolean) => {
    set({ isOnline, isInternetReachable: isOnline });
  },

  setSyncing: (isSyncing: boolean) => {
    set({ isSyncing });
  },

  setPendingCount: (pendingCount: number) => {
    set({ pendingCount });
  },

  setLastSyncTime: (lastSyncTime: string) => {
    set({ lastSyncTime });
  },

  checkConnectivity: async () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
      const online = navigator.onLine;
      set({ isOnline: online, isInternetReachable: online });
      return online;
    }
    // Default optimistic online
    return get().isOnline;
  },
}));
