import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 11: Profile Deepening & Milestones Types & API Verification', async (t) => {
  await t.test('types.ts defines comprehensive streak, aura, heatmap, and privacy schemas', () => {
    const typesPath = path.join(FRONTEND_DIR, 'src/api/types.ts');
    assert.ok(fs.existsSync(typesPath), 'types.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.ok(content.includes('export interface StreakBadge'), 'Must export StreakBadge');
    assert.ok(content.includes('export interface MoodStreakInfo'), 'Must export MoodStreakInfo');
    assert.ok(content.includes('export interface AuraScoreBreakdown'), 'Must export AuraScoreBreakdown');
    assert.ok(content.includes('export interface MoodHeatmapDay'), 'Must export MoodHeatmapDay');
    assert.ok(content.includes('export interface PrivacySettingsPayload'), 'Must export PrivacySettingsPayload');
    assert.ok(content.includes('export interface UserStatsResponse'), 'Must export UserStatsResponse');

    // Field checks
    assert.ok(content.includes('current_streak: number;'), 'MoodStreakInfo includes current_streak');
    assert.ok(content.includes('weekly_activity: boolean[];'), 'MoodStreakInfo includes weekly_activity');
    assert.ok(content.includes('progress_percentage: number;'), 'AuraScoreBreakdown includes progress_percentage');
    assert.ok(content.includes('points_to_next_tier: number;'), 'AuraScoreBreakdown includes points_to_next_tier');
    assert.ok(content.includes('incognito_by_default: boolean;'), 'PrivacySettingsPayload includes incognito_by_default');
    assert.ok(content.includes('profile_visibility:'), 'PrivacySettingsPayload includes profile_visibility');
  });

  await t.test('users.ts provides full suite of streak, aura, heatmap, and privacy API endpoints', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/users.ts');
    assert.ok(fs.existsSync(apiPath), 'users.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');

    assert.ok(content.includes('getUserStats('), 'Must provide getUserStats');
    assert.ok(content.includes('getMoodStreak('), 'Must provide getMoodStreak');
    assert.ok(content.includes('getAuraBreakdown('), 'Must provide getAuraBreakdown');
    assert.ok(content.includes('getMoodHeatmap('), 'Must provide getMoodHeatmap');
    assert.ok(content.includes('getPrivacySettings('), 'Must provide getPrivacySettings');
    assert.ok(content.includes('updatePrivacySettings('), 'Must provide updatePrivacySettings');

    assert.ok(content.includes("apiClient.get<UserStatsResponse>('/users/me/stats')"), 'Queries /users/me/stats');
    assert.ok(content.includes("apiClient.get<MoodStreakInfo>('/users/me/streak')"), 'Queries /users/me/streak');
    assert.ok(content.includes("apiClient.get<AuraScoreBreakdown>('/users/me/aura')"), 'Queries /users/me/aura');
    assert.ok(content.includes("apiClient.get<MoodHeatmapDay[]>('/users/me/heatmap'"), 'Queries /users/me/heatmap');
    assert.ok(content.includes("apiClient.patch<PrivacySettingsPayload>('/users/me/privacy'"), 'Patches /users/me/privacy');
  });
});

test('Stage 11: React Query User Stats & Privacy Hooks Verification', async (t) => {
  await t.test('useUserStats.ts exports query and mutation hooks with query keys', () => {
    const hooksPath = path.join(FRONTEND_DIR, 'src/hooks/useUserStats.ts');
    assert.ok(fs.existsSync(hooksPath), 'useUserStats.ts must exist');
    const content = fs.readFileSync(hooksPath, 'utf8');

    assert.ok(content.includes('userStatsKeys'), 'Exports userStatsKeys query keys');
    assert.ok(content.includes('export function useMoodStreak'), 'Exports useMoodStreak');
    assert.ok(content.includes('export function useAuraBreakdown'), 'Exports useAuraBreakdown');
    assert.ok(content.includes('export function useMoodHeatmap'), 'Exports useMoodHeatmap');
    assert.ok(content.includes('export function usePrivacySettings'), 'Exports usePrivacySettings');
    assert.ok(content.includes('export function useUpdatePrivacySettings'), 'Exports useUpdatePrivacySettings');

    assert.ok(content.includes('onMutate'), 'useUpdatePrivacySettings provides optimistic updates');
  });

  await t.test('src/hooks/index.ts re-exports useUserStats', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/hooks/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes("export * from './useUserStats';"), 'Re-exports useUserStats');
  });
});

test('Stage 11: Profile Deepening UI Components Verification', async (t) => {
  await t.test('MoodStreakTracker renders flame counter, weekly activity dots, and milestone badges', () => {
    const compPath = path.join(FRONTEND_DIR, 'src/components/profile/MoodStreakTracker.tsx');
    assert.ok(fs.existsSync(compPath), 'MoodStreakTracker.tsx must exist');
    const content = fs.readFileSync(compPath, 'utf8');

    assert.ok(content.includes('export const MoodStreakTracker'), 'Must export MoodStreakTracker');
    assert.ok(content.includes('current_streak'), 'Displays current streak number');
    assert.ok(content.includes('DAYS_OF_WEEK'), 'Displays weekly day labels');
    assert.ok(content.includes('weekly_activity'), 'Maps weekly activity dots');
    assert.ok(content.includes('streak_milestone_badges'), 'Renders milestone badges row');
    assert.ok(content.includes('longest_streak'), 'Displays personal best longest streak');
  });

  await t.test('MoodHistoryHeatmap renders multi-week grid and interactive selection details', () => {
    const compPath = path.join(FRONTEND_DIR, 'src/components/profile/MoodHistoryHeatmap.tsx');
    assert.ok(fs.existsSync(compPath), 'MoodHistoryHeatmap.tsx must exist');
    const content = fs.readFileSync(compPath, 'utf8');

    assert.ok(content.includes('export const MoodHistoryHeatmap'), 'Must export MoodHistoryHeatmap');
    assert.ok(content.includes('weeks.map'), 'Renders week rows');
    assert.ok(content.includes('dominant_emotion'), 'Colors cells according to emotion');
    assert.ok(content.includes('intensity_average'), 'Scales opacity with intensity');
    assert.ok(content.includes('handleDayPress'), 'Handles interactive day selection');
    assert.ok(content.includes('detailBanner'), 'Renders selected day detail banner');
  });

  await t.test('AuraScoreCard displays tier progress, points target, and expandable harmonics', () => {
    const compPath = path.join(FRONTEND_DIR, 'src/components/profile/AuraScoreCard.tsx');
    assert.ok(fs.existsSync(compPath), 'AuraScoreCard.tsx must exist');
    const content = fs.readFileSync(compPath, 'utf8');

    assert.ok(content.includes('export const AuraScoreCard'), 'Must export AuraScoreCard');
    assert.ok(content.includes('total_score'), 'Displays total aura score');
    assert.ok(content.includes('tier_color'), 'Themes display with tier color');
    assert.ok(content.includes('progress_percentage'), 'Renders visual progress fill');
    assert.ok(content.includes('breakdown'), 'Displays breakdown metrics');
  });

  await t.test('src/components/profile/index.ts and global barrel re-export all profile components', () => {
    const profileBarrelPath = path.join(FRONTEND_DIR, 'src/components/profile/index.ts');
    assert.ok(fs.existsSync(profileBarrelPath), 'src/components/profile/index.ts must exist');
    const profileContent = fs.readFileSync(profileBarrelPath, 'utf8');
    assert.ok(profileContent.includes("export * from './MoodStreakTracker';"), 'Exports MoodStreakTracker');
    assert.ok(profileContent.includes("export * from './MoodHistoryHeatmap';"), 'Exports MoodHistoryHeatmap');
    assert.ok(profileContent.includes("export * from './AuraScoreCard';"), 'Exports AuraScoreCard');

    const globalBarrelPath = path.join(FRONTEND_DIR, 'src/components/index.ts');
    const globalContent = fs.readFileSync(globalBarrelPath, 'utf8');
    assert.ok(globalContent.includes("export * from './profile';"), 'Global barrel re-exports ./profile');
  });
});

test('Stage 11: Profile & Settings Screens Deepening Verification', async (t) => {
  await t.test('ProfileScreen integrates streak tracker, aura breakdown, heatmap, and cloak toggle', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/profile/ProfileScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'ProfileScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const ProfileScreen'), 'Must export ProfileScreen');
    assert.ok(content.includes('MoodStreakTracker'), 'Embeds MoodStreakTracker');
    assert.ok(content.includes('AuraScoreCard'), 'Embeds AuraScoreCard');
    assert.ok(content.includes('MoodHistoryHeatmap'), 'Embeds MoodHistoryHeatmap');
    assert.ok(content.includes('cloakBanner'), 'Provides Wandering Spirit quick-cloak banner');
    assert.ok(content.includes('useUpdatePrivacySettings'), 'Updates incognito state via privacy mutation');
  });

  await t.test('SettingsScreen provides granular privacy, location fuzzing, and data sovereignty', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/profile/SettingsScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'SettingsScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const SettingsScreen'), 'Must export SettingsScreen');
    assert.ok(content.includes('incognito_by_default'), 'Controls default incognito status');
    assert.ok(content.includes('location_fuzzing'), 'Controls atmospheric location fuzzing');
    assert.ok(content.includes('allow_echo_matching'), 'Controls resonance matching permission');
    assert.ok(content.includes('profile_visibility'), 'Provides profile sanctuary visibility selector');
    assert.ok(content.includes('handleExportData'), 'Provides data sovereignty export action');
    assert.ok(content.includes('handleLogout'), 'Provides logout safeguards');
    assert.ok(content.includes('handleDeleteAccount'), 'Provides account deletion safeguards');
  });
});
