import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme, getEmotionConfig } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Tactile } from '@/components/common/Tactile';
import { PingDot } from '@/components/common/PingDot';
import { inkOnPastel } from '@/theme/colors';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { useHotspots } from '@/hooks/useAnchors';
import { NotificationTile } from '@/components/social/NotificationTile';
import { Ionicons } from '@expo/vector-icons';
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';
import { useRespondConnection } from '@/hooks/useSocial';
import { NotificationResponse, NotificationCategory } from '@/api/types';

export type FilterCategory =
  | 'all'
  | 'unread'
  | 'echoes'
  | 'connections'
  | 'sanctuaries'
  | 'mindful';

const FILTER_TABS: { label: string; value: FilterCategory; icon: string }[] = [
  { label: 'All Signals', value: 'all', icon: 'sparkles-outline' },
  { label: 'Unread', value: 'unread', icon: 'ellipse' },
  { label: 'Echoes & Hugs', value: 'echoes', icon: 'heart-outline' },
  { label: 'Connections', value: 'connections', icon: 'people-outline' },
  { label: 'Sanctuaries', value: 'sanctuaries', icon: 'planet-outline' },
  { label: 'Mindful', value: 'mindful', icon: 'leaf-outline' },
];

// Rich fallback notifications so screen is always full of life and emotional warmth
const MOCK_NOTIFICATIONS: NotificationResponse[] = [
  {
    id: 'notif-1',
    user_id: 'me',
    type: 'match',
    category: 'echo_match',
    title: 'New Resonance Match',
    message: 'matched your current wavelength with 95% emotional resonance.',
    is_read: false,
    data: {
      actor_id: 'usr-101',
      actor_name: 'Aria Vane',
      actor_avatar: null,
      emotion: 'calm',
      resonance_score: 95,
      target_type: 'chat',
    },
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'me',
    type: 'follow_request',
    category: 'connection_request',
    title: 'Connection Request',
    message: 'wants to connect with your emotional journey and share echoes.',
    is_read: false,
    data: {
      actor_id: 'usr-102',
      actor_name: 'Kai Takahashi',
      actor_avatar: null,
      connection_id: 'conn-102',
      emotion: 'gratitude',
    },
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    user_id: 'me',
    type: 'like',
    category: 'empathy_reaction',
    title: 'Empathy Hug Sent',
    message: 'sent a warm virtual hug to your mood reflection "Morning coastal mist".',
    is_read: false,
    data: {
      actor_id: 'usr-103',
      actor_name: 'Sarah Chen',
      actor_avatar: null,
      emotion: 'joy',
      reaction_type: 'hug',
      target_type: 'checkin',
      target_id: 'bubble-1',
    },
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-4',
    user_id: 'me',
    type: 'comment',
    category: 'comment_echo',
    title: 'Gentle Echo Left',
    message: 'left an echo: "Your honesty here reminded me that healing takes quiet time."',
    is_read: true,
    data: {
      actor_id: 'usr-104',
      actor_name: 'Marcus Aurel',
      actor_avatar: null,
      emotion: 'sadness',
      target_type: 'post',
      target_id: 'post-1',
    },
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-5',
    user_id: 'me',
    type: 'community',
    category: 'community_activity',
    title: 'Sanctuary Atmospheric Shift',
    message: 'A collective wave of Gratitude is flowing through Morning Solitude.',
    is_read: true,
    data: {
      community_id: 'comm-1',
      community_name: 'Morning Solitude Sanctuary',
      emotion: 'gratitude',
      target_type: 'community',
    },
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-6',
    user_id: 'me',
    type: 'reminder',
    category: 'mindful_reminder',
    title: 'Evening Breath & Release',
    message: 'The sun has set. Take a gentle breath and release how you are feeling tonight.',
    is_read: true,
    data: {
      emotion: 'calm',
      target_type: 'checkin',
    },
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-7',
    user_id: 'me',
    type: 'milestone',
    category: 'streak_milestone',
    title: '7-Day Mindful Release Streak',
    message: 'You have tuned into your emotional soul for 7 consecutive days! ✨',
    is_read: true,
    data: {
      milestone_count: 7,
      emotion: 'joy',
    },
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

function formatRelativeTimestamp(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const NotificationsScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [respondingIds, setRespondingIds] = useState<Record<string, boolean>>({});

  const { data: apiNotifications, isLoading, isRefetching, refetch } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();
  const deleteMutation = useDeleteNotification();
  const respondConnectionMutation = useRespondConnection();

  // Combine API data or fallback
  const allNotifications: NotificationResponse[] = useMemo(() => {
    if (apiNotifications && apiNotifications.length > 0) return apiNotifications;
    return MOCK_NOTIFICATIONS;
  }, [apiNotifications]);

  const unreadCount = useMemo(
    () => allNotifications.filter((n) => !n.is_read).length,
    [allNotifications],
  );

  const { data: pulseData } = useAtmosphericPulse();
  // Live emotional clusters straight from the server's PostGIS grouping.
  const { data: hotspots } = useHotspots(2, 2);
  const topHotspot = hotspots && hotspots.length > 0 ? hotspots[0] : null;

  const filteredNotifications = useMemo(() => {
    return allNotifications.filter((item) => {
      if (activeTab === 'unread') return !item.is_read;
      if (activeTab === 'echoes') {
        return (
          item.category === 'empathy_reaction' ||
          item.category === 'comment_echo' ||
          item.type === 'like' ||
          item.type === 'comment'
        );
      }
      if (activeTab === 'connections') {
        return (
          item.category === 'connection_request' ||
          item.category === 'connection_accepted' ||
          item.category === 'echo_match' ||
          item.type === 'follow_request' ||
          item.type === 'follow_accept' ||
          item.type === 'match'
        );
      }
      if (activeTab === 'sanctuaries') {
        return item.category === 'community_activity' || item.type === 'community';
      }
      if (activeTab === 'mindful') {
        return (
          item.category === 'mindful_reminder' ||
          item.category === 'streak_milestone' ||
          item.type === 'reminder' ||
          item.type === 'milestone'
        );
      }
      return true;
    });
  }, [allNotifications, activeTab]);

  const handleMarkAllRead = useCallback(() => {
    markAllReadMutation.mutate();
  }, [markAllReadMutation]);

  const handleNotificationPress = useCallback(
    (item: NotificationResponse) => {
      // Mark as read immediately
      if (!item.is_read) {
        markReadMutation.mutate(item.id);
      }

      // Navigate based on target type
      const targetType = item.data?.target_type;
      if (targetType === 'chat' || item.category === 'echo_match') {
        navigation.navigate('ChatsTab', { screen: 'EchoMatch' });
      } else if (targetType === 'community' && item.data?.community_id) {
        navigation.navigate('HomeTab', {
          screen: 'CommunityFlow',
          params: {
            screen: 'CommunityDetail',
            params: {
              communityId: item.data.community_id,
              communityName: item.data.community_name || 'Sanctuary',
            },
          },
        });
      } else if (item.category === 'connection_request' && item.data?.actor_id) {
        navigation.navigate('ProfileTab', {
          screen: 'UserProfile',
          params: {
            userId: item.data.actor_id,
            username: item.data.actor_name || 'User',
          },
        });
      } else if (targetType === 'checkin' && item.data?.target_id) {
        navigation.navigate('HomeTab', {
          screen: 'BubbleDetails',
          params: { bubbleId: item.data.target_id, emotion: item.data.emotion },
        });
      }
    },
    [markReadMutation, navigation],
  );

  const handleConnectionResponse = useCallback(
    (item: NotificationResponse, action: 'accept' | 'decline') => {
      const connectionId = item.data?.connection_id || item.id;
      setRespondingIds((prev) => ({ ...prev, [item.id]: true }));

      respondConnectionMutation.mutate(
        { connectionId, action },
        {
          onSettled: () => {
            setRespondingIds((prev) => ({ ...prev, [item.id]: false }));
            markReadMutation.mutate(item.id);
          },
        },
      );
    },
    [respondConnectionMutation, markReadMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: NotificationResponse }) => (
      <NotificationTile
        id={item.id}
        type={item.type}
        category={item.category}
        actorName={item.data?.actor_name}
        actorAvatar={item.data?.actor_avatar}
        title={item.title}
        message={item.message || item.body || ''}
        timestamp={formatRelativeTimestamp(item.created_at)}
        isRead={item.is_read}
        emotion={item.data?.emotion}
        data={item.data}
        isResponding={!!respondingIds[item.id]}
        onPress={() => handleNotificationPress(item)}
        onAcceptConnection={() => handleConnectionResponse(item, 'accept')}
        onDeclineConnection={() => handleConnectionResponse(item, 'decline')}
        onDelete={() => deleteMutation.mutate(item.id)}
      />
    ),
    [
      respondingIds,
      handleNotificationPress,
      handleConnectionResponse,
      deleteMutation,
    ],
  );

  const keyExtractor = useCallback((item: NotificationResponse) => item.id, []);

  return (
    <ScreenWrapper style={styles.container}>
      {/* ── Masthead ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.headerTitles}>
          <Typography variant="overline" style={{ color: colors.textMuted }}>
            MOODSPACE
          </Typography>
          <View style={styles.titleRow}>
            <Typography variant="h2" style={{ color: colors.textPrimary }}>
              Alerts
            </Typography>
            {unreadCount > 0 && (
              <View style={[styles.unreadCountBadge, { backgroundColor: colors.primary, borderColor: colors.ink }]}>
                <Typography variant="overline" style={{ color: inkOnPastel }}>
                  {unreadCount} NEW
                </Typography>
              </View>
            )}
          </View>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            activeOpacity={0.75}
            style={[styles.markReadBtn, { borderColor: colors.ink, backgroundColor: colors.surface }]}
            accessibilityLabel="Mark all as read"
          >
            <Ionicons name="checkmark-done-outline" size={14} color={colors.textPrimary} />
            <Typography variant="overline" style={{ color: colors.textPrimary, marginLeft: 5 }}>
              READ ALL
            </Typography>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Vibe radar scan ── */}
      <Tactile offset={4} radius={20} style={styles.radarCard} contentStyle={styles.radarInner}>
        <View style={styles.radarLeft}>
          <PingDot size={8} />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Typography variant="label" style={{ color: colors.textPrimary }}>
              Vibe Radar Scan
            </Typography>
            <Typography variant="caption" numberOfLines={1} style={{ color: colors.textMuted }}>
              {topHotspot
                ? `${topHotspot.bubble_count} bubbles clustering${topHotspot.city ? ` in ${topHotspot.city.split(',')[0]}` : ''}`
                : typeof pulseData?.active_bubbles_count === 'number'
                  ? `Listening to ${pulseData.active_bubbles_count.toLocaleString()} live pulses`
                  : 'Listening for live pulses nearby'}
            </Typography>
          </View>
        </View>
        <View
          style={[
            styles.radarBadge,
            {
              backgroundColor: topHotspot ? getEmotionConfig(topHotspot.dominant_emotion).primary : colors.secondary,
              borderColor: colors.ink,
            },
          ]}
        >
          <Typography variant="overline" style={{ color: inkOnPastel }}>
            {topHotspot ? getEmotionConfig(topHotspot.dominant_emotion).label.toUpperCase() : 'LIVE'}
          </Typography>
        </View>
      </Tactile>

      {/* ── Filter Tabs ── */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {FILTER_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                activeOpacity={0.75}
                onPress={() => setActiveTab(tab.value)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.tabChip,
                  {
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderColor: colors.ink,
                  },
                ]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={12}
                  color={isActive ? inkOnPastel : colors.textSecondary}
                />
                <Typography
                  variant="label"
                  style={{ color: isActive ? inkOnPastel : colors.textSecondary, marginLeft: 5 }}
                >
                  {tab.label}
                  {tab.value === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Notification Feed ── */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              height={76}
              borderRadius={theme.radius.lg}
              style={styles.skeletonItem}
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredNotifications}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="🕊️"
              title="All Caught Up"
              description="Your emotional horizon is peaceful and clear. You have acknowledged all echoes and connection requests."
              actionTitle="Refresh Signals"
              onAction={() => refetch()}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  radarCard: {
    marginHorizontal: 16,
    marginTop: 12,
  },
  radarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  radarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  radarBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 2,
  },
  headerTitles: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  unreadCountBadge: {
    borderWidth: 2,
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  subtitle: {
    marginTop: 4,
  },
  markReadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: theme.radius.round,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 4,
  },
  tabContainer: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  tabScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  tabChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.round,
    borderWidth: 2,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 40,
  },
  loadingContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    gap: 8,
  },
  skeletonItem: {
    marginBottom: 8,
  },
});
