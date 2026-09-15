import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 12: Offline Data Contracts & Schemas Verification', async (t) => {
  await t.test('offline.ts defines OfflineActionType, QueuedAction, NetworkState, SyncResult', () => {
    const typesPath = path.join(FRONTEND_DIR, 'src/types/offline.ts');
    assert.ok(fs.existsSync(typesPath), 'src/types/offline.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.ok(content.includes('export type OfflineActionType'), 'Exports OfflineActionType');
    assert.ok(content.includes("'CREATE_BUBBLE'"), 'Supports CREATE_BUBBLE action');
    assert.ok(content.includes("'EMPATHY_REACTION'"), 'Supports EMPATHY_REACTION action');
    assert.ok(content.includes("'ADD_COMMENT'"), 'Supports ADD_COMMENT action');
    assert.ok(content.includes("'SEND_MESSAGE'"), 'Supports SEND_MESSAGE action');
    assert.ok(content.includes("'JOIN_COMMUNITY'"), 'Supports JOIN_COMMUNITY action');
    assert.ok(content.includes("'LEAVE_COMMUNITY'"), 'Supports LEAVE_COMMUNITY action');
    assert.ok(content.includes("'CREATE_COMMUNITY_POST'"), 'Supports CREATE_COMMUNITY_POST action');
    assert.ok(content.includes("'UPDATE_PRIVACY'"), 'Supports UPDATE_PRIVACY action');

    assert.ok(content.includes('export interface QueuedAction<T = any>'), 'Exports QueuedAction generic interface');
    assert.ok(content.includes('export interface NetworkState'), 'Exports NetworkState');
    assert.ok(content.includes('export interface SyncResult'), 'Exports SyncResult');

    // Field verification
    assert.ok(content.includes('retryCount: number;'), 'QueuedAction tracks retryCount');
    assert.ok(content.includes('maxRetries: number;'), 'QueuedAction tracks maxRetries');
    assert.ok(content.includes('isOnline: boolean;'), 'NetworkState tracks isOnline');
    assert.ok(content.includes('isSyncing: boolean;'), 'NetworkState tracks isSyncing');
    assert.ok(content.includes('lastChecked: string;'), 'NetworkState tracks lastChecked');
  });
});

test('Stage 12: Network State Store & Connectivity Verification', async (t) => {
  await t.test('networkStore.ts manages reactive online and sync states', () => {
    const storePath = path.join(FRONTEND_DIR, 'src/stores/networkStore.ts');
    assert.ok(fs.existsSync(storePath), 'src/stores/networkStore.ts must exist');
    const content = fs.readFileSync(storePath, 'utf8');

    assert.ok(content.includes('export const useNetworkStore'), 'Exports useNetworkStore');
    assert.ok(content.includes('isOnline: true'), 'Defaults isOnline to true');
    assert.ok(content.includes('isSyncing: false'), 'Defaults isSyncing to false');
    assert.ok(content.includes('pendingCount: 0'), 'Defaults pendingCount to 0');
    assert.ok(content.includes('setOnline:'), 'Provides setOnline action');
    assert.ok(content.includes('setSyncing:'), 'Provides setSyncing action');
    assert.ok(content.includes('setPendingCount:'), 'Provides setPendingCount action');
    assert.ok(content.includes('setLastSyncTime:'), 'Provides setLastSyncTime action');
    assert.ok(content.includes('checkConnectivity:'), 'Provides checkConnectivity probe');
  });
});

test('Stage 12: Offline Outbox Queue & Sync Service Verification', async (t) => {
  await t.test('offlineSyncService.ts implements persistent queue, retry backoff, and cache invalidation', () => {
    const servicePath = path.join(FRONTEND_DIR, 'src/services/offlineSyncService.ts');
    assert.ok(fs.existsSync(servicePath), 'src/services/offlineSyncService.ts must exist');
    const content = fs.readFileSync(servicePath, 'utf8');

    assert.ok(content.includes('export class OfflineSyncService'), 'Exports OfflineSyncService class');
    assert.ok(content.includes('export const offlineSyncService'), 'Exports offlineSyncService singleton');
    assert.ok(content.includes('enqueue<T>'), 'Provides enqueue method');
    assert.ok(content.includes('getQueue()'), 'Provides getQueue method');
    assert.ok(content.includes('clearQueue()'), 'Provides clearQueue method');
    assert.ok(content.includes('processQueue('), 'Provides processQueue method');
    assert.ok(content.includes('removeAction('), 'Provides removeAction method');
    assert.ok(content.includes('invalidateCachesForAction('), 'Triggers queryClient cache invalidation');
  });
});

test('Stage 12: TanStack QueryClient OfflineFirst Upgrade Verification', async (t) => {
  await t.test('queryClient.ts configures networkMode offlineFirst and cache hydration', () => {
    const clientPath = path.join(FRONTEND_DIR, 'src/api/queryClient.ts');
    assert.ok(fs.existsSync(clientPath), 'src/api/queryClient.ts must exist');
    const content = fs.readFileSync(clientPath, 'utf8');

    assert.ok(content.includes("networkMode: 'offlineFirst'"), 'Configures networkMode as offlineFirst');
    assert.ok(content.includes('hydrateQueryCache'), 'Exports hydrateQueryCache function');
    assert.ok(content.includes('persistQueryCache'), 'Exports persistQueryCache function');
  });
});

test('Stage 12: Offline Hook & UI Banner Verification', async (t) => {
  await t.test('useOfflineSync hook orchestrates network probe and automatic background sync', () => {
    const hookPath = path.join(FRONTEND_DIR, 'src/hooks/useOfflineSync.ts');
    assert.ok(fs.existsSync(hookPath), 'src/hooks/useOfflineSync.ts must exist');
    const content = fs.readFileSync(hookPath, 'utf8');

    assert.ok(content.includes('export function useOfflineSync'), 'Exports useOfflineSync');
    assert.ok(content.includes('offlineSyncService.processQueue()'), 'Calls processQueue on reconnect');

    const barrelPath = path.join(FRONTEND_DIR, 'src/hooks/index.ts');
    const barrelContent = fs.readFileSync(barrelPath, 'utf8');
    assert.ok(barrelContent.includes("export * from './useOfflineSync';"), 'Re-exported in src/hooks/index.ts');
  });

  await t.test('OfflineBanner floating pill UI and App.tsx mount', () => {
    const bannerPath = path.join(FRONTEND_DIR, 'src/components/common/OfflineBanner.tsx');
    assert.ok(fs.existsSync(bannerPath), 'OfflineBanner.tsx must exist');
    const bannerContent = fs.readFileSync(bannerPath, 'utf8');

    assert.ok(bannerContent.includes('export const OfflineBanner'), 'Exports OfflineBanner');
    assert.ok(bannerContent.includes('useNetworkStore'), 'Reads from networkStore');
    assert.ok(bannerContent.includes('offlineSyncService.processQueue()'), 'Triggers manual sync');
    assert.ok(bannerContent.includes('bannerOffline'), 'Has distinct offline theme styling');
    assert.ok(bannerContent.includes('bannerSyncing'), 'Has distinct syncing theme styling');

    // App.tsx mount check
    const appPath = path.join(FRONTEND_DIR, 'App.tsx');
    const appContent = fs.readFileSync(appPath, 'utf8');
    assert.ok(appContent.includes('<OfflineBanner />'), 'App.tsx mounts OfflineBanner');
  });
});
