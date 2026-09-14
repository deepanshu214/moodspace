import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { MoodTag } from '@/components/mood/MoodTag';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { AuraDisplay } from '@/components/social/AuraDisplay';
import { MoodStreakTracker } from '@/components/profile/MoodStreakTracker';
import { MoodHistoryHeatmap } from '@/components/profile/MoodHistoryHeatmap';
import { AuraScoreCard } from '@/components/profile/AuraScoreCard';

import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { useMoodHistory } from '@/hooks/useMood';
import {
  useMoodStreak,
  useAuraBreakdown,
  useMoodHeatmap,
  usePrivacySettings,
  useUpdatePrivacySettings,
  MOCK_STREAK_INFO,
  MOCK_AURA_BREAKDOWN,
} from '@/hooks/useUserStats';
import { Ionicons } from '@expo/vector-icons';
import { StreakBadge } from '@/api/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user: storeUser } = useAuthStore();
  const { data: apiUser } = useCurrentUser();
  const { data: moodHistory } = useMoodHistory(10, 0);

  // Stage 11 Stats Hooks
  const { data: streakData } = useMoodStreak();
  const { data: auraData } = useAuraBreakdown();
  const { data: heatmapDays } = useMoodHeatmap(35);
  const { data: privacyData } = usePrivacySettings();
  const updatePrivacyMutation = useUpdatePrivacySettings();

  const [incognitoLocal, setIncognitoLocal] = useState<boolean | null>(null);

  const displayName = apiUser?.display_name || storeUser?.displayName || 'Elena Rostova';
  const bio = apiUser?.bio || storeUser?.bio || 'Holding space for calm moments, deep ocean walks, and mindful connection.';
  const avatarUrl = apiUser?.avatar_url || storeUser?.avatarUrl;

  const streak = streakData || MOCK_STREAK_INFO;
  const aura = auraData || MOCK_AURA_BREAKDOWN;
  const heatmap = heatmapDays || [];
  const isIncognito = incognitoLocal !== null
    ? incognitoLocal
    : (privacyData?.incognito_by_default ?? false);

  const handleToggleIncognito = (value: boolean) => {
    setIncognitoLocal(value);
    updatePrivacyMutation.mutate({ incognito_by_default: value });
  };

  const handleBadgePress = (badge: StreakBadge) => {
    Alert.alert(
      badge.title,
      `${badge.description}\n\nStatus: ${badge.unlocked ? '✨ Unlocked' : `🔒 Reach a ${badge.days_required}-day streak`}`
    );
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* ── Top Bar: Title & Settings ── */}
      <View style={styles.topBar}>
        <View style={styles.topBarTitleRow}>
          <Typography variant="h2" weight="bold">
            Emotional Soul
          </Typography>
        </View>

        <View style={styles.topBarActions}>
          <IconButton
            icon={<Ionicons name="settings-outline" size={22} color={theme.colors.textPrimary} />}
            variant="ghost"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>
      </View>

      {/* ── Wandering Spirit Quick-Cloak Banner ── */}
      <View style={[styles.cloakBanner, isIncognito && styles.cloakBannerActive]}>
        <View style={styles.cloakInfo}>
          <Ionicons
            name={isIncognito ? 'eye-off' : 'eye-outline'}
            size={18}
            color={isIncognito ? '#FD79A8' : theme.colors.textMuted}
          />
          <View style={styles.cloakTexts}>
            <Typography variant="bodySmall" weight="semibold" color={isIncognito ? '#FD79A8' : theme.colors.textPrimary}>
              {isIncognito ? 'Ghost / Incognito Mode' : 'Public Profile'}
            </Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>
              {isIncognito ? 'Your name is hidden on map & posts' : 'Your name and avatar are visible'}
            </Typography>
          </View>
        </View>

        <Switch
          value={isIncognito}
          onValueChange={handleToggleIncognito}
          trackColor={{ false: theme.colors.border, true: '#FD79A8' }}
        />
      </View>

      {/* ── Profile Header ── */}
      <View style={styles.profileHeader}>
        <Avatar
          name={displayName}
          source={avatarUrl}
          size="xl"
          emotion={isIncognito ? undefined : 'calm'}
        />

        <Typography variant="h2" weight="bold" style={styles.name}>
          {isIncognito ? '👻 Anonymous User' : displayName}
        </Typography>

        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.bio}>
          {bio}
        </Typography>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography variant="h3" weight="bold">
              {streak.total_checkins || moodHistory?.length || 24}
            </Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Check-ins
            </Typography>
          </View>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FollowersList', { type: 'followers' })}
          >
            <Typography variant="h3" weight="bold">148</Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>Followers</Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FollowersList', { type: 'following' })}
          >
            <Typography variant="h3" weight="bold">92</Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>Following</Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Mood Streak Tracker ── */}
      <MoodStreakTracker
        streakInfo={streak}
        onBadgePress={handleBadgePress}
      />

      {/* ── Aura Score Card ── */}
      <AuraScoreCard aura={aura} />

      {/* ── Mood History Heatmap (35 Days) ── */}
      <MoodHistoryHeatmap days={heatmap} />

      {/* ── Quick Action Navigation Grid ── */}
      <View style={styles.actionsGrid}>
        <Button
          title="Edit Profile"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('EditProfile')}
          leftIcon={<Ionicons name="pencil" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Follow Requests"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('FollowRequests')}
          leftIcon={<Ionicons name="person-add" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Reveal Requests"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('ProfileViewRequests')}
          leftIcon={<Ionicons name="eye" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
      </View>

      {/* ── Recent Emotional Footprint ── */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold" style={styles.sectionTitle}>
          Recent Emotional Waves
        </Typography>

        <View style={styles.historyPills}>
          {moodHistory && moodHistory.length > 0 ? (
            moodHistory.map((h, i) => (
              <MoodTag
                key={h.id || i}
                emotion={h.primary_emotion}
                secondaryEmotion={h.secondary_emotion}
                intensity={h.intensity}
              />
            ))
          ) : (
            <>
              <MoodTag emotion="calm" secondaryEmotion="Peaceful" intensity={7} />
              <MoodTag emotion="joy" secondaryEmotion="Grateful" intensity={9} />
              <MoodTag emotion="love" secondaryEmotion="Warm" intensity={8} />
            </>
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
    backgroundColor: theme.colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  topBarTitleRow: {
    flex: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cloakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  cloakBannerActive: {
    backgroundColor: 'rgba(253, 121, 168, 0.08)',
    borderColor: 'rgba(253, 121, 168, 0.3)',
  },
  cloakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
    gap: 10,
  },
  cloakTexts: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  name: {
    marginTop: theme.spacing.md,
    marginBottom: 4,
  },
  bio: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    flex: 1,
    minWidth: 140,
  },
  historyPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
