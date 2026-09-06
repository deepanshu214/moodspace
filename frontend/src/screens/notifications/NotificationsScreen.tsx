import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Chip } from '@/components/common/Chip';
import { NotificationTile, NotificationType } from '@/components/social/NotificationTile';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

interface NotificationItem {
  id: string;
  type: NotificationType;
  actorName: string;
  actorAvatar?: string | null;
  message: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'match',
    actorName: 'Sarah Chen',
    message: 'matched with your emotional journey in Calm & Serene.',
    timestamp: '5m ago',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'like',
    actorName: 'Marcus Aurel',
    message: 'resonated with your reflection on morning fog.',
    timestamp: '32m ago',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'comment',
    actorName: 'Kai Takahashi',
    message: 'left a gentle echo on your mood bubble.',
    timestamp: '2h ago',
    isRead: true,
  },
  {
    id: 'n-4',
    type: 'follow_request',
    actorName: 'Aria Vance',
    message: 'requested to connect with your emotional profile.',
    timestamp: 'Yesterday',
    isRead: true,
  },
  {
    id: 'n-5',
    type: 'system',
    actorName: 'MoodSpace',
    message: 'Weekly reflection pulse is ready to view in your insights.',
    timestamp: '2d ago',
    isRead: true,
  },
];

export const NotificationsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => {
    if (activeTab === 'Unread') return !n.isRead;
    if (activeTab === 'Likes') return n.type === 'like';
    if (activeTab === 'Connections') return n.type === 'follow_request' || n.type === 'follow_accept';
    return true;
  });

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" weight="bold">
          Notifications
        </Typography>
        <TouchableOpacity onPress={markAllRead} activeOpacity={0.7}>
          <Typography variant="bodySmall" color={theme.colors.primaryLight} weight="semibold">
            Mark all read
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabRow}>
        {['All', 'Unread', 'Likes', 'Connections'].map((tab) => (
          <Chip
            key={tab}
            label={tab}
            selected={activeTab === tab}
            onPress={() => setActiveTab(tab)}
          />
        ))}
      </View>

      {/* Notification List */}
      <View style={styles.list}>
        {filtered.map((item) => (
          <NotificationTile
            key={item.id}
            id={item.id}
            type={item.type}
            actorName={item.actorName}
            actorAvatar={item.actorAvatar}
            message={item.message}
            timestamp={item.timestamp}
            isRead={item.isRead}
          />
        ))}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.lg,
  },
  list: {
    gap: 6,
  },
});
