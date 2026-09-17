import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Ionicons } from '@expo/vector-icons';

export interface CommentCardProps {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  auraScore?: number;
  content: string;
  timestamp: string;
  likesCount?: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  onReplyPress?: () => void;
  style?: ViewStyle;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  authorName,
  authorAvatar,
  auraScore,
  content,
  timestamp,
  likesCount = 0,
  isLiked = false,
  onLikePress,
  onReplyPress,
  style,
}) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { borderBottomColor: colors.border }, style]}>
      <Avatar source={authorAvatar} name={authorName} size="sm" />

      <View style={styles.body}>
        <View style={styles.header}>
          <Typography variant="bodySmall" weight="semibold">
            {authorName}
          </Typography>
          {auraScore !== undefined && (
            <Typography variant="caption" color={colors.primaryLight} style={styles.auraBadge}>
              ⚡ {auraScore}
            </Typography>
          )}
          <Typography variant="caption" color={colors.textMuted} style={styles.time}>
            {timestamp}
          </Typography>
        </View>

        <Typography variant="body" color={colors.textPrimary} style={styles.content}>
          {content}
        </Typography>

        <View style={styles.actions}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onLikePress}
            style={styles.actionBtn}
          >
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={15}
              color={isLiked ? colors.error : colors.textSecondary}
            />
            {likesCount > 0 && (
              <Typography
                variant="caption"
                color={isLiked ? colors.error : colors.textSecondary}
                style={styles.actionText}
              >
                {likesCount}
              </Typography>
            )}
          </TouchableOpacity>

          {onReplyPress && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onReplyPress}
              style={styles.actionBtn}
            >
              <Typography variant="caption" color={colors.textMuted}>
                Reply
              </Typography>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  body: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  auraBadge: {
    marginLeft: 6,
    fontSize: 11,
  },
  time: {
    marginLeft: 'auto',
  },
  content: {
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  actionText: {
    marginLeft: 4,
  },
});
