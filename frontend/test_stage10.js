import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 10: Notification API & Types Architecture', async (t) => {
  await t.test('types.ts defines comprehensive notification categories and payload schema', () => {
    const typesPath = path.join(FRONTEND_DIR, 'src/api/types.ts');
    assert.ok(fs.existsSync(typesPath), 'types.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.ok(content.includes('export type NotificationCategory'), 'Must export NotificationCategory');
    assert.ok(content.includes('export interface NotificationData'), 'Must export NotificationData');
    assert.ok(content.includes('export interface NotificationResponse'), 'Must export NotificationResponse');

    // Category checks
    const expectedCategories = [
      'empathy_reaction',
      'comment_echo',
      'echo_match',
      'connection_request',
      'connection_accepted',
      'community_activity',
      'mindful_reminder',
      'streak_milestone',
    ];

    for (const cat of expectedCategories) {
      assert.ok(content.includes(cat), `NotificationCategory must include ${cat}`);
    }

    // Parity fields
    assert.ok(content.includes('title: string;'), 'NotificationResponse includes title');
    assert.ok(content.includes('body?: string;'), 'NotificationResponse includes body');
    assert.ok(content.includes('message?: string;'), 'NotificationResponse includes message');
    assert.ok(content.includes('is_read: boolean;'), 'NotificationResponse includes is_read');
    assert.ok(content.includes('data?: NotificationData;'), 'NotificationResponse includes structured data');
  });

  await t.test('notification.ts provides full suite of notification operations', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/notification.ts');
    assert.ok(fs.existsSync(apiPath), 'notification.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');

    assert.ok(content.includes('getNotifications('), 'Must provide getNotifications');
    assert.ok(content.includes('markRead('), 'Must provide markRead');
    assert.ok(content.includes('markAllRead('), 'Must provide markAllRead');
    assert.ok(content.includes('deleteNotification('), 'Must provide deleteNotification');

    assert.ok(content.includes("apiClient.get<NotificationResponse[]>('/notification'"), 'Queries /notification endpoint');
    assert.ok(content.includes('/read'), 'Targets read status endpoint');
  });
});

test('Stage 10: React Query Notifications Hooks Architecture', async (t) => {
  await t.test('useNotifications.ts exports query and mutation hooks with optimistic updates', () => {
    const hooksPath = path.join(FRONTEND_DIR, 'src/hooks/useNotifications.ts');
    assert.ok(fs.existsSync(hooksPath), 'useNotifications.ts must exist');
    const content = fs.readFileSync(hooksPath, 'utf8');

    assert.ok(content.includes('notificationKeys'), 'Exports query keys');
    assert.ok(content.includes('export const useNotifications'), 'Exports useNotifications hook');
    assert.ok(content.includes('export const useMarkNotificationRead'), 'Exports useMarkNotificationRead hook');
    assert.ok(content.includes('export const useMarkAllNotificationsRead'), 'Exports useMarkAllNotificationsRead hook');
    assert.ok(content.includes('export const useDeleteNotification'), 'Exports useDeleteNotification hook');

    assert.ok(content.includes('onMutate'), 'Provides optimistic updates on read actions');
    assert.ok(content.includes('refetchInterval'), 'Periodically polls for fresh activity signals');
  });

  await t.test('src/hooks/index.ts re-exports all notification hooks', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/hooks/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes("export * from './useNotifications';"), 'Re-exports notification hooks');
  });
});

test('Stage 10: Notification Tile & Visual Interactions Verification', async (t) => {
  await t.test('NotificationTile handles diverse emotional signals and inline connection actions', () => {
    const tilePath = path.join(FRONTEND_DIR, 'src/components/social/NotificationTile.tsx');
    assert.ok(fs.existsSync(tilePath), 'NotificationTile.tsx must exist');
    const content = fs.readFileSync(tilePath, 'utf8');

    assert.ok(content.includes('export const NotificationTile'), 'Must export NotificationTile');
    assert.ok(content.includes('onAcceptConnection'), 'Provides onAcceptConnection callback');
    assert.ok(content.includes('onDeclineConnection'), 'Provides onDeclineConnection callback');
    assert.ok(content.includes('actionsRow'), 'Renders inline action button row for requests');
    assert.ok(content.includes('resonancePill'), 'Renders resonance match indicator');
    assert.ok(content.includes('communityPill'), 'Renders sanctuary indicator');
    assert.ok(content.includes('unreadDot'), 'Renders unread state dot');
  });

  await t.test('social barrel index re-exports NotificationTile', () => {
    const barrelPath = path.join(FRONTEND_DIR, 'src/components/social/index.ts');
    assert.ok(fs.existsSync(barrelPath), 'src/components/social/index.ts must exist');
    const content = fs.readFileSync(barrelPath, 'utf8');
    assert.ok(content.includes("export * from './NotificationTile';"), 'Re-exports NotificationTile');
  });
});

test('Stage 10: Notifications Screen & Navigation Integration Verification', async (t) => {
  await t.test('NotificationsScreen provides 6 categorized filter tabs and interactive signals', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/notifications/NotificationsScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'NotificationsScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const NotificationsScreen'), 'Must export NotificationsScreen');
    assert.ok(content.includes('FILTER_TABS'), 'Provides categorized filter tabs');
    assert.ok(content.includes('unreadCount'), 'Calculates unread badge number');
    assert.ok(content.includes('useMarkAllNotificationsRead'), 'Wires mark all read mutation');
    assert.ok(content.includes('useRespondConnection'), 'Wires inline connection response hook');
    assert.ok(content.includes('formatRelativeTimestamp'), 'Formats human-readable relative timestamps');
    assert.ok(content.includes('handleNotificationPress'), 'Provides contextual navigation routing');
  });

  await t.test('MainTabNavigator correctly registers NotificationsTab pointing to NotificationsScreen', () => {
    const navPath = path.join(FRONTEND_DIR, 'src/navigation/MainTabNavigator.tsx');
    assert.ok(fs.existsSync(navPath), 'MainTabNavigator.tsx must exist');
    const content = fs.readFileSync(navPath, 'utf8');

    assert.ok(content.includes('name="NotificationsTab"'), 'Registers NotificationsTab');
    assert.ok(content.includes('component={NotificationsScreen}'), 'Points to NotificationsScreen component');
    assert.ok(content.includes('tabBarIcon'), 'Displays notifications icon with badge support');
  });
});
