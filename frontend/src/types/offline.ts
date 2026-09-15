export type OfflineActionType =
  | 'CREATE_BUBBLE'
  | 'EMPATHY_REACTION'
  | 'ADD_COMMENT'
  | 'SEND_MESSAGE'
  | 'JOIN_COMMUNITY'
  | 'LEAVE_COMMUNITY'
  | 'CREATE_COMMUNITY_POST'
  | 'UPDATE_PRIVACY';

export interface QueuedAction<T = any> {
  id: string;
  type: OfflineActionType;
  payload: T;
  timestamp: string;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
}

export interface NetworkState {
  isOnline: boolean;
  isInternetReachable: boolean;
  isSyncing: boolean;
  lastChecked: string;
}

export interface SyncResult {
  total: number;
  processed: number;
  failed: number;
  remaining: number;
}
