import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Ionicons } from '@expo/vector-icons';
import { NotificationCategory, NotificationData } from '@/api/types';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow_request'
  | 'follow_accept'
  | 'match'
  | 'community'
  | 'reminder'
  | 'milestone'
  | 'system';

export interface NotificationTileProps {
  id: string;
  type: string;
  category?: NotificationCategory;
  actorName?: string;
  actorAvatar?: string | null;
  title?: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
  emotion?: string;
  data?: NotificationData;
  onPress?: () => void;
  onAcceptConnection?: () => void;
  onDeclineConnection?: () => void;
  onDelete?: () => void;
  isResponding?: boolean;
  style?: ViewStyle;
}

export const NotificationTile: React.FC<NotificationTileProps> = ({
  type,
  category,
  actorName,
  actorAvatar,
  title,
  message,
  timestamp,
  isRead = false,
  emotion,
  data,
  onPress,
  onAcceptConnection,
  onDeclineConnection,
  onDelete,
  isResponding = false,
  style,
}) => {
  const getCategoryConfig = () => {
    const key = category || type;
    switch (key) {
      case 'empathy_reaction':
      case 'like':
        return {
          icon: 'heart',
          color: theme.colors.error,
          bg: 'rgba(255, 118, 117, 0.15)',
          label: 'Empathy',
        };
      case 'comment_echo':
      case 'comment':
        return {
          icon: 'chatbubble',
          color: theme.colors.accent,
          bg: 'rgba(0, 206, 201, 0.15)',
          label: 'Echo',
        };
      case 'echo_match':
      case 'match':
        return {
          icon: 'sparkles',
          color: '#FFB800',
          bg: 'rgba(255, 184, 0, 0.15)',
          label: 'Resonance',
        };
      case 'connection_request':
      case 'follow_request':
        return {
          icon: 'person-add',
          color: theme.colors.primaryLight,
          bg: 'rgba(108, 92, 231, 0.15)',
          label: 'Connection',
        };
      case 'connection_accepted':
      case 'follow_accept':
        return {
          icon: 'people',
          color: theme.colors.success,
          bg: 'rgba(0, 184, 148, 0.15)',
          label: 'Connected',
        };
      case 'community_activity':
      case 'community':
        return {
          icon: 'planet',
          color: '#A29BFE',
          bg: 'rgba(162, 155, 254, 0.15)',
          label: 'Sanctuary',
        };
      case 'streak_milestone':
      case 'milestone':
        return {
          icon: 'flame',
          color: '#FD79A8',
          bg: 'rgba(253, 121, 168, 0.15)',
          label: 'Milestone',
        };
      case 'mindful_reminder':
      case 'reminder':
        return {
          icon: 'leaf',
          color: '#86EFAC',
          bg: 'rgba(134, 239, 172, 0.15)',
          label: 'Mindfulness',
        };
      case 'system':
      default:
        return {
          icon: 'notifications',
          color: theme.colors.info,
          bg: 'rgba(9, 132, 227, 0.15)',
          label: 'Signal',
        };
    }
  };

  const config = getCategoryConfig();
  const emotionCfg = emotion ? theme.getEmotionConfig(emotion) : null;
  const isConnectionReq = category === 'connection_request' || type === 'follow_request';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.container,
        !isRead ? styles.unreadContainer : styles.readContainer,
        emotionCfg && { borderLeftColor: emotionCfg.primary, borderLeftWidth: 3 },
        style,
      ]}
    >
      {/* Avatar or Category Icon */}
      <View style={styles.avatarWrapper}>
        <Avatar
          source={actorAvatar}
          name={actorName || title || 'MoodSpace'}
          size="md"
          emotion={emotion}
        />
        <View style={[styles.typeBadge, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={10} color="#FFFFFF" />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title or Actor Row */}
        <View style={styles.topRow}>
          <View style={styles.titleCol}>
            {actorName ? (
              <Typography variant="body" weight={!isRead ? 'bold' : 'semibold'} numberOfLines={1}>
                {actorName}
              </Typography>
            ) : title ? (
              <Typography variant="body" weight={!isRead ? 'bold' : 'semibold'} numberOfLines={1}>
                {title}
              </Typography>
            ) : null}
          </View>

          <Typography variant="caption" color={theme.colors.textMuted} style={styles.timestamp}>
            {timestamp}
          </Typography>
        </View>

        {/* Message body */}
        <Typography
          variant="bodySmall"
          color={!isRead ? theme.colors.textPrimary : theme.colors.textSecondary}
          numberOfLines={2}
          style={styles.messageText}
        >
          {message}
        </Typography>

        {/* Resonance or Community badge */}
        {data?.resonance_score !== undefined && data.resonance_score > 0 && (
          <View style={styles.resonancePill}>
            <Ionicons name="sparkles" size={10} color={theme.colors.secondary} />
            <Typography variant="caption" color={theme.colors.secondary} style={styles.badgeText}>
              {data.resonance_score}% Resonance Match
            </Typography>
          </View>
        )}

        {data?.community_name && (
          <View style={styles.communityPill}>
            <Ionicons name="planet-outline" size={10} color={theme.colors.primaryLight} />
            <Typography variant="caption" color={theme.colors.primaryLight} style={styles.badgeText}>
              {data.community_name}
            </Typography>
          </View>
        )}

        {/* Inline Action Buttons for Connection Requests */}
        {isConnectionReq && onAcceptConnection && onDeclineConnection && (
          <View style={styles.actionsRow}>
            <Button
              title={isResponding ? 'Connecting…' : 'Accept'}
              variant="primary"
              size="sm"
              onPress={onAcceptConnection}
              disabled={isResponding}
              style={styles.actionBtn}
            />
            <Button
              title="Decline"
              variant="ghost"
              size="sm"
              onPress={onDeclineConnection}
              disabled={isResponding}
              style={styles.actionBtn}
            />
          </View>
        )}
      </View>

      {/* Unread dot */}
      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  readContainer: {
    backgroundColor: theme.colors.surface,
  },
  unreadContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderColor: theme.colors.borderLight,
  },
  avatarWrapper: {
    position: 'relative',
    marginTop: 2,
  },
  typeBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: theme.radius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  titleCol: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  timestamp: {
    fontSize: 11,
  },
  messageText: {
    lineHeight: 18,
  },
  resonancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(253, 121, 168, 0.1)',
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  communityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  actionBtn: {
    minWidth: 84,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.primaryLight,
    marginLeft: theme.spacing.sm,
    marginTop: 6,
  },
});
