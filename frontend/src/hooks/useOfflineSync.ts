import { useEffect, useCallback } from 'react';
import { useNetworkStore } from '@/stores/networkStore';
import { offlineSyncService } from '@/services/offlineSyncService';
import { OfflineActionType, QueuedAction } from '@/types/offline';
import { hydrateQueryCache } from '@/api/queryClient';

export function useOfflineSync() {
  const isOnline = useNetworkStore((s) => s.isOnline);
  const isSyncing = useNetworkStore((s) => s.isSyncing);
  const pendingCount = useNetworkStore((s) => s.pendingCount);
  const lastSyncTime = useNetworkStore((s) => s.lastSyncTime);
  const checkConnectivity = useNetworkStore((s) => s.checkConnectivity);

  // Initialize offline cache hydration & initial queue inspection
  useEffect(() => {
    hydrateQueryCache();
    offlineSyncService.getQueue().then((q) => {
      useNetworkStore.getState().setPendingCount(q.length);
    });
    checkConnectivity();
  }, [checkConnectivity]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      offlineSyncService.processQueue();
    }
  }, [isOnline, pendingCount, isSyncing]);

  const syncNow = useCallback(async () => {
    return await offlineSyncService.processQueue();
  }, []);

  const clearOutbox = useCallback(async () => {
    await offlineSyncService.clearQueue();
  }, []);

  const enqueueAction = useCallback(
    async <T>(type: OfflineActionType, payload: T): Promise<QueuedAction<T>> => {
      return await offlineSyncService.enqueue(type, payload);
    },
    [],
  );

  return {
    isOnline,
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncNow,
    clearOutbox,
    enqueueAction,
  };
}
