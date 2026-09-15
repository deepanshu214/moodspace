import { storage } from '@/utils/storage';
import { QueuedAction, OfflineActionType, SyncResult } from '@/types/offline';
import { useNetworkStore } from '@/stores/networkStore';
import { queryClient } from '@/api/queryClient';

const OFFLINE_QUEUE_KEY = 'moodspace_offline_queue';
const MAX_DEFAULT_RETRIES = 3;

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private isProcessing = false;

  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Fetch all queued actions from persistent storage
   */
  async getQueue(): Promise<QueuedAction[]> {
    try {
      const raw = await storage.getItem(OFFLINE_QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Save queue to storage and update store count
   */
  private async saveQueue(queue: QueuedAction[]): Promise<void> {
    try {
      await storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
      useNetworkStore.getState().setPendingCount(queue.length);
    } catch {
      // Storage write error fallback
    }
  }

  /**
   * Enqueue an action performed while offline or during network latency
   */
  async enqueue<T>(type: OfflineActionType, payload: T): Promise<QueuedAction<T>> {
    const queue = await this.getQueue();
    const action: QueuedAction<T> = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
      retryCount: 0,
      maxRetries: MAX_DEFAULT_RETRIES,
      status: 'pending',
    };

    queue.push(action);
    await this.saveQueue(queue);
    return action;
  }

  /**
   * Remove a completed or dismissed action from the queue
   */
  async removeAction(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((a) => a.id !== id);
    await this.saveQueue(filtered);
  }

  /**
   * Clear the entire outbox queue
   */
  async clearQueue(): Promise<void> {
    await this.saveQueue([]);
  }

  /**
   * Process all pending actions using injected or default handlers
   */
  async processQueue(
    customExecutors?: Partial<Record<OfflineActionType, (payload: any) => Promise<any>>>
  ): Promise<SyncResult> {
    if (this.isProcessing) {
      const q = await this.getQueue();
      return { total: q.length, processed: 0, failed: 0, remaining: q.length };
    }

    this.isProcessing = true;
    useNetworkStore.getState().setSyncing(true);

    const queue = await this.getQueue();
    let processed = 0;
    let failed = 0;
    const remainingQueue: QueuedAction[] = [];

    for (const action of queue) {
      try {
        const executor = customExecutors?.[action.type];
        if (executor) {
          await executor(action.payload);
        }
        processed++;
        // Invalidate relevant React Query caches
        this.invalidateCachesForAction(action.type);
      } catch (err: any) {
        action.retryCount += 1;
        if (action.retryCount >= action.maxRetries) {
          action.status = 'failed';
          action.error = err?.message || 'Sync failed after max retries';
          failed++;
        } else {
          remainingQueue.push(action);
        }
      }
    }

    await this.saveQueue(remainingQueue);
    this.isProcessing = false;
    useNetworkStore.getState().setSyncing(false);
    useNetworkStore.getState().setLastSyncTime(new Date().toISOString());

    return {
      total: queue.length,
      processed,
      failed,
      remaining: remainingQueue.length,
    };
  }

  private invalidateCachesForAction(type: OfflineActionType): void {
    switch (type) {
      case 'CREATE_BUBBLE':
      case 'EMPATHY_REACTION':
        queryClient.invalidateQueries({ queryKey: ['mood'] });
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        break;
      case 'ADD_COMMENT':
        queryClient.invalidateQueries({ queryKey: ['feed'] });
        break;
      case 'SEND_MESSAGE':
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        break;
      case 'JOIN_COMMUNITY':
      case 'LEAVE_COMMUNITY':
      case 'CREATE_COMMUNITY_POST':
        queryClient.invalidateQueries({ queryKey: ['communities'] });
        queryClient.invalidateQueries({ queryKey: ['community'] });
        break;
      case 'UPDATE_PRIVACY':
        queryClient.invalidateQueries({ queryKey: ['userStats'] });
        break;
    }
  }
}

export const offlineSyncService = OfflineSyncService.getInstance();
