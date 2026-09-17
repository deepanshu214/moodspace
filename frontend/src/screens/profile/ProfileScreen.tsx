import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { ProfileStackParamList } from '@/navigation/types';
import { theme, shadows } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { MoodTag } from '@/components/mood/MoodTag';
import { GlassCard } from '@/components/common/GlassCard';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import {
  MoodStreakTracker,
  MoodHistoryHeatmap,
  AuraScoreCard,
  EditProfileModal,
} from '@/components/profile';
import { storage } from '@/utils/storage';
import { getUserPostedBubbles, deleteUserPostedBubble, UserPostBubble } from '@/utils/userPosts';

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
import { haptics } from '@/theme/haptics';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user: storeUser } = useAuthStore();
  const { data: apiUser } = useCurrentUser();
  const { data: moodHistory } = useMoodHistory(10, 0);

  // Stats Hooks
  const { data: streakData } = useMoodStreak();
  const { data: auraData } = useAuraBreakdown();
  const { data: heatmapDays } = useMoodHeatmap(35);
  const { data: privacyData } = usePrivacySettings();
  const updatePrivacyMutation = useUpdatePrivacySettings();

  const [incognitoLocal, setIncognitoLocal] = useState<boolean | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [customName, setCustomName] = useState<string | null>(null);
  const [customBio, setCustomBio] = useState<string | null>(null);
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const saved = await storage.getItem('user_profile_custom_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.displayName) setCustomName(parsed.displayName);
          if (parsed.bio) setCustomBio(parsed.bio);
          if (parsed.avatarUrl) setCustomAvatar(parsed.avatarUrl);
        }
      } catch {}
    };
    loadProfile();
  }, []);

  const displayName = customName || apiUser?.display_name || storeUser?.displayName || 'Elena Rostova';
  const bio = customBio || apiUser?.bio || storeUser?.bio || 'Holding space for calm moments, deep ocean walks, and mindful connection.';
  const avatarUrl = customAvatar || apiUser?.avatar_url || storeUser?.avatarUrl;

  const streak = streakData || MOCK_STREAK_INFO;
  const aura = auraData || MOCK_AURA_BREAKDOWN;
  const heatmap = heatmapDays || [];
  const isIncognito = incognitoLocal !== null
    ? incognitoLocal
    : (privacyData?.incognito_by_default ?? false);

  const [myPosts, setMyPosts] = useState<UserPostBubble[]>([]);

  const loadMyPosts = useCallback(async () => {
    const posts = await getUserPostedBubbles();
    setMyPosts(posts);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyPosts();
    }, [loadMyPosts])
  );

  const handleDeletePost = (id: string) => {
    Alert.alert(
      'Delete Echo',
      'Are you sure you want to remove this reflection from your profile?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.medium();
            const updated = await deleteUserPostedBubble(id);
            setMyPosts(updated);
          },
        },
      ]
    );
  };

  const handleToggleIncognito = (value: boolean) => {
    setIncognitoLocal(value);
    haptics.selection();
    updatePrivacyMutation.mutate({ incognito_by_default: value });
  };

  const handleBadgePress = (badge: StreakBadge) => {
    haptics.light();
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
          <Typography variant="h2" weight="bold" style={{ color: colors.textPrimary }}>
            Your Space & Memories
          </Typography>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={[styles.settingsPill, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}
            onPress={() => {
              navigation.navigate('Settings');
              haptics.light();
            }}
            activeOpacity={0.7}
            accessibilityLabel="Open Settings"
          >
            <Ionicons name="settings-outline" size={16} color={colors.primary} />
            <Typography variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 6 }}>
              Settings
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Wandering Spirit Quick-Cloak Glass Banner ── */}
      <GlassCard
        variant="default"
        style={[styles.cloakBanner, isIncognito && styles.cloakBannerActive]}
      >
        <View style={styles.cloakInfo}>
          <Ionicons
            name={isIncognito ? 'eye-off' : 'eye-outline'}
            size={18}
            color={isIncognito ? colors.secondary : colors.textMuted}
          />
          <View style={styles.cloakTexts}>
            <Typography variant="bodySmall" weight="semibold" color={isIncognito ? colors.secondary : colors.textPrimary}>
              {isIncognito ? 'Ghost / Incognito Mode' : 'Public Profile'}
            </Typography>
            <Typography variant="caption" color={colors.textMuted}>
              {isIncognito ? 'Your name is hidden on map & posts' : 'Your name and avatar are visible'}
            </Typography>
          </View>
        </View>

        <Switch
          value={isIncognito}
          onValueChange={handleToggleIncognito}
          trackColor={{ false: colors.glass.border, true: colors.secondary }}
        />
      </GlassCard>

      {/* ── Profile Header ── */}
      <View style={styles.profileHeader}>
        <Avatar
          name={displayName}
          source={avatarUrl}
          size="xl"
          emotion={isIncognito ? undefined : 'calm'}
          isOnline
        />

        <Typography variant="h2" weight="bold" style={[styles.name, { color: colors.textPrimary }]}>
          {isIncognito ? '👻 Anonymous User' : displayName}
        </Typography>

        <Typography variant="bodySmall" color={colors.textSecondary} style={styles.bio}>
          {bio}
        </Typography>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setShowEditModal(true);
            haptics.light();
          }}
          style={styles.editProfileBtn}
        >
          <Ionicons name="pencil" size={13} color={colors.primaryLight} />
          <Typography variant="caption" weight="bold" color={colors.primaryLight} style={{ marginLeft: 6 }}>
            Edit Profile
          </Typography>
        </TouchableOpacity>

        {/* Glass Bento Stats Row */}
        <GlassCard variant="default" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Typography variant="stat" style={{ color: colors.primaryLight }}>
                {streak.total_checkins || moodHistory?.length || 24}
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Check-ins
              </Typography>
            </View>

            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('FollowersList', { type: 'followers' });
                haptics.light();
              }}
            >
              <Typography variant="stat" style={{ color: colors.textPrimary }}>
                148
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Followers
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.statBox}
              activeOpacity={0.7}
              onPress={() => {
                navigation.navigate('FollowersList', { type: 'following' });
                haptics.light();
              }}
            >
              <Typography variant="stat" style={{ color: colors.textPrimary }}>
                92
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Following
              </Typography>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </View>

      {/* ── Mood Streak Tracker ── */}
      <MoodStreakTracker
        streakInfo={streak}
        onBadgePress={handleBadgePress}
      />

      {/* ── Aura Score Card ── */}
      <AuraScoreCard aura={aura} />

      {/* ── Mood History Heatmap ── */}
      <MoodHistoryHeatmap days={heatmap} />

      {/* ── My Shared Echoes (What I Posted) ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Typography variant="overline" color={colors.textMuted} style={styles.sectionTitle}>
            MY SHARED ECHOES & POSTS
          </Typography>
          <View style={[styles.badgeCount, { backgroundColor: colors.surfaceElevated, borderColor: colors.glass.border }]}>
            <Typography variant="caption" weight="bold" color={colors.primaryLight}>
              {myPosts.length}
            </Typography>
          </View>
        </View>

        {myPosts.length > 0 ? (
          <View style={styles.myPostsList}>
            {myPosts.map((post) => (
              <GlassCard key={post.id} variant="default" style={styles.postCard}>
                <View style={styles.postHeaderRow}>
                  <View style={styles.postEmotionRow}>
                    <MoodTag
                      emotion={post.emotion}
                      secondaryEmotion={post.secondaryEmotion}
                      intensity={post.intensity}
                    />
                    {post.isAnonymous && (
                      <View style={[styles.anonBadge, { borderColor: colors.glass.border }]}>
                        <Typography variant="caption" style={{ fontSize: 11, color: colors.secondary }}>
                          👻 Ghost
                        </Typography>
                      </View>
                    )}
                  </View>

                  <View style={styles.postHeaderRight}>
                    <Typography variant="caption" color={colors.textMuted} style={{ marginRight: 8 }}>
                      {post.timestamp || 'Recent'}
                    </Typography>
                    <TouchableOpacity
                      onPress={() => handleDeletePost(post.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Typography variant="body" color={colors.textPrimary} style={styles.postContent}>
                  "{post.content}"
                </Typography>

                <View style={styles.postFooterRow}>
                  <View style={styles.postLocationRow}>
                    <Ionicons name="location-outline" size={13} color={colors.textMuted} />
                    <Typography variant="caption" color={colors.textMuted} style={{ marginLeft: 4 }}>
                      {post.locationCity || 'Worldwide'}
                    </Typography>
                    {post.weatherTemp !== undefined && (
                      <Typography variant="caption" color={colors.textMuted} style={{ marginLeft: 8 }}>
                        • {post.weatherTemp}°C {post.weatherCondition}
                      </Typography>
                    )}
                  </View>

                  <View style={styles.postLikesRow}>
                    <Ionicons name="heart" size={13} color="#FD79A8" />
                    <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: 4 }}>
                      {post.likesCount || 0}
                    </Typography>
                  </View>
                </View>
              </GlassCard>
            ))}
          </View>
        ) : (
          <GlassCard variant="compact" style={styles.emptyPostsCard}>
            <Typography style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>🌱</Typography>
            <Typography variant="body" weight="semibold" color={colors.textPrimary} style={{ textAlign: 'center' }}>
              No Shared Echoes Yet
            </Typography>
            <Typography variant="caption" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 4, marginBottom: 12 }}>
              When you drop a mood bubble on the map, your reflections are saved here so you can revisit them anytime.
            </Typography>
            <Button
              title="Share Your First Mood"
              variant="aurora"
              size="sm"
              onPress={() => {
                haptics.light();
                (navigation as any).navigate('HomeTab', { screen: 'CreateBubble' });
              }}
              leftIcon={<Ionicons name="add" size={16} color="#FFFFFF" />}
            />
          </GlassCard>
        )}
      </View>

      {/* ── Quick Action Navigation Grid ── */}
      <View style={styles.actionsGrid}>
        <Button
          title="Edit Profile"
          variant="glass"
          size="md"
          onPress={() => {
            navigation.navigate('EditProfile');
            haptics.light();
          }}
          leftIcon={<Ionicons name="pencil" size={16} color={colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Settings"
          variant="glass"
          size="md"
          onPress={() => {
            navigation.navigate('Settings');
            haptics.light();
          }}
          leftIcon={<Ionicons name="settings-outline" size={16} color={colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Follow Requests"
          variant="glass"
          size="md"
          onPress={() => {
            navigation.navigate('FollowRequests');
            haptics.light();
          }}
          leftIcon={<Ionicons name="person-add" size={16} color={colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Reveal Requests"
          variant="glass"
          size="md"
          onPress={() => {
            navigation.navigate('ProfileViewRequests');
            haptics.light();
          }}
          leftIcon={<Ionicons name="eye" size={16} color={colors.textPrimary} />}
          style={styles.actionBtn}
        />
      </View>

      {/* ── Recent Emotional Footprint ── */}
      <View style={styles.section}>
        <Typography variant="overline" color={colors.textMuted} style={styles.sectionTitle}>
          RECENT EMOTIONAL WAVES
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

      {/* ── Edit Profile Modal with Gallery Permission ── */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentName={displayName}
        currentBio={bio}
        currentAvatar={avatarUrl}
        onSave={(updated) => {
          setCustomName(updated.displayName);
          setCustomBio(updated.bio);
          if (updated.avatarUrl) setCustomAvatar(updated.avatarUrl);
          storage.setItem('user_profile_custom_v1', JSON.stringify(updated));
        }}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  cloakBannerActive: {
    borderColor: 'rgba(253, 121, 168, 0.35)',
  },
  cloakInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
    gap: 10,
  },
  cloakTexts: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    marginTop: 14,
    marginBottom: 4,
  },
  bio: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: 16,
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.25)',
    marginTop: 10,
    marginBottom: 4,
  },
  statsCard: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
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
  settingsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  myPostsList: {
    gap: 12,
  },
  postCard: {
    padding: 14,
    borderRadius: 18,
  },
  postHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  postEmotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  anonBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  postHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  postFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  postLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postLikesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyPostsCard: {
    alignItems: 'center',
    padding: 20,
  },
});
