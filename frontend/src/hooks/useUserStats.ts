import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '@/api/users';
import {
  MoodStreakInfo,
  AuraScoreBreakdown,
  MoodHeatmapDay,
  PrivacySettingsPayload,
  UserStatsResponse,
} from '@/api/types';

export const userStatsKeys = {
  all: ['userStats'] as const,
  stats: () => [...userStatsKeys.all, 'summary'] as const,
  streak: () => [...userStatsKeys.all, 'streak'] as const,
  aura: () => [...userStatsKeys.all, 'aura'] as const,
  heatmap: (days?: number) => [...userStatsKeys.all, 'heatmap', days ?? 60] as const,
  privacy: () => [...userStatsKeys.all, 'privacy'] as const,
};

// Fallback data for offline/mock mode
export const MOCK_STREAK_INFO: MoodStreakInfo = {
  current_streak: 7,
  longest_streak: 14,
  total_checkins: 42,
  last_checkin_date: new Date().toISOString(),
  has_checked_in_today: true,
  weekly_activity: [true, true, true, true, true, true, true],
  streak_milestone_badges: [
    {
      id: 'badge-1',
      days_required: 3,
      title: '3-Day Spark',
      description: 'Ignited your emotional awareness journey.',
      icon: 'sparkles',
      unlocked: true,
      unlocked_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'badge-2',
      days_required: 7,
      title: '7-Day Flame',
      description: 'One full week of continuous self-reflection.',
      icon: 'flame',
      unlocked: true,
      unlocked_at: new Date().toISOString(),
    },
    {
      id: 'badge-3',
      days_required: 30,
      title: '30-Day Solstice',
      description: 'A full moon cycle of emotional presence.',
      icon: 'sunny',
      unlocked: false,
    },
    {
      id: 'badge-4',
      days_required: 100,
      title: '100-Day Cosmic',
      description: 'A deep, enduring bond with your inner soul.',
      icon: 'planet',
      unlocked: false,
    },
  ],
};

export const MOCK_AURA_BREAKDOWN: AuraScoreBreakdown = {
  total_score: 480,
  tier: 'Harmonic Empath',
  tier_color: '#A29BFE',
  tier_emoji: '💜',
  next_tier: 'Radiant Luminary',
  points_to_next_tier: 20,
  progress_percentage: 96,
  breakdown: {
    checkin_consistency: 180,
    empathy_reactions_given: 120,
    supportive_comments: 80,
    sanctuary_participation: 60,
    resonance_connections: 40,
  },
};

export const MOCK_PRIVACY_SETTINGS: PrivacySettingsPayload = {
  incognito_by_default: false,
  location_fuzzing: true,
  profile_visibility: 'public',
  allow_echo_matching: true,
  show_streak_on_profile: true,
  show_aura_on_profile: true,
  sound_effects_enabled: true,
  haptics_enabled: true,
  daily_reminder_hour: 20,
};

export function useMoodStreak() {
  return useQuery<MoodStreakInfo>({
    queryKey: userStatsKeys.streak(),
    queryFn: async () => {
      try {
        return await usersApi.getMoodStreak();
      } catch {
        return MOCK_STREAK_INFO;
      }
    },
    staleTime: 60_000,
  });
}

export function useAuraBreakdown() {
  return useQuery<AuraScoreBreakdown>({
    queryKey: userStatsKeys.aura(),
    queryFn: async () => {
      try {
        return await usersApi.getAuraBreakdown();
      } catch {
        return MOCK_AURA_BREAKDOWN;
      }
    },
    staleTime: 60_000,
  });
}

export function useMoodHeatmap(days = 35) {
  return useQuery<MoodHeatmapDay[]>({
    queryKey: userStatsKeys.heatmap(days),
    queryFn: async () => {
      try {
        return await usersApi.getMoodHeatmap(days);
      } catch {
        // Generate realistic 35-day fallback heatmap
        const emotions = ['calm', 'joy', 'love', 'gratitude', 'sadness', 'anxiety', 'neutral'];
        const list: MoodHeatmapDay[] = [];
        const today = new Date();
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const hasCheckin = i % 5 !== 0; // miss every 5th day for realism
          list.push({
            date: dateStr,
            count: hasCheckin ? 1 + (i % 3) : 0,
            dominant_emotion: hasCheckin ? emotions[i % emotions.length] : undefined,
            intensity_average: hasCheckin ? 5 + (i % 5) : undefined,
          });
        }
        return list;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function usePrivacySettings() {
  return useQuery<PrivacySettingsPayload>({
    queryKey: userStatsKeys.privacy(),
    queryFn: async () => {
      try {
        return await usersApi.getPrivacySettings();
      } catch {
        return MOCK_PRIVACY_SETTINGS;
      }
    },
    staleTime: 5 * 60_000,
  });
}

export function useUpdatePrivacySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<PrivacySettingsPayload>) =>
      usersApi.updatePrivacySettings(payload),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: userStatsKeys.privacy() });
      const previous = queryClient.getQueryData<PrivacySettingsPayload>(userStatsKeys.privacy());

      if (previous) {
        queryClient.setQueryData<PrivacySettingsPayload>(userStatsKeys.privacy(), {
          ...previous,
          ...newSettings,
        });
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userStatsKeys.privacy(), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userStatsKeys.privacy() });
    },
  });
}
