import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Ionicons } from '@expo/vector-icons';

export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow_request'
  | 'follow_accept'
  | 'match'
  | 'system';

export interface NotificationTileProps {
  id: string;
  type: NotificationType;
  actorName?: string;
  actorAvatar?: string | null;
  message: string;
  timestamp: string;
  isRead?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const NotificationTile: React.FC<NotificationTileProps> = ({
  type,
  actorName,
  actorAvatar,
  message,
  timestamp,
  isRead = false,
  onPress,
  style,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'like':
        return { icon: 'heart', color: theme.colors.error, bg: 'rgba(255, 118, 117, 0.15)' };
      case 'comment':
        return { icon: 'chatbubble', color: theme.colors.accent, bg: 'rgba(0, 206, 201, 0.15)' };
      case 'follow_request':
        return { icon: 'person-add', color: theme.colors.primaryLight, bg: 'rgba(108, 92, 231, 0.15)' };
      case 'follow_accept':
        return { icon: 'people', color: theme.colors.success, bg: 'rgba(0, 184, 148, 0.15)' };
      case 'match':
        return { icon: 'sparkles', color: '#FFB800', bg: 'rgba(255, 184, 0, 0.15)' };
      case 'system':
      default:
        return { icon: 'notifications', color: theme.colors.info, bg: 'rgba(9, 132, 227, 0.15)' };
    }
  };

  const config = getTypeConfig();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: isRead ? 'transparent' : theme.colors.surfaceHighlight },
        style,
      ]}
    >
      <View style={styles.avatarContainer}>
        <Avatar source={actorAvatar} name={actorName} size="md" />
        <View style={[styles.typeIconBadge, { backgroundColor: config.color }]}>
          <Ionicons name={config.icon as any} size={11} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.content}>
        <Typography variant="body" numberOfLines={2} style={styles.messageText}>
          {actorName ? (
            <Typography variant="body" weight="semibold">
              {actorName}{' '}
            </Typography>
          ) : null}
          {message}
        </Typography>

        <Typography variant="caption" color={theme.colors.textMuted} style={styles.timestamp}>
          {timestamp}
        </Typography>
      </View>

      {!isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    marginBottom: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  typeIconBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.background,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  messageText: {
    lineHeight: 20,
  },
  timestamp: {
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryLight,
    marginLeft: theme.spacing.sm,
  },
});
