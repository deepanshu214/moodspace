import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { MoodTag } from './MoodTag';
import { IconButton } from '../common/IconButton';
import { Ionicons } from '@expo/vector-icons';

export interface BubbleDetailCardProps {
  id: string;
  authorName?: string;
  authorAvatar?: string | null;
  auraScore?: number;
  isAnonymous?: boolean;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content?: string;
  locationCity?: string;
  weatherCondition?: string;
  weatherTemp?: number;
  timestamp: string;
  likesCount?: number;
  isLiked?: boolean;
  commentsCount?: number;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onReportPress?: () => void;
  onAuthorPress?: () => void;
  style?: ViewStyle;
}

export const BubbleDetailCard: React.FC<BubbleDetailCardProps> = ({
  authorName = 'Anonymous Soul',
  authorAvatar,
  auraScore,
  isAnonymous = false,
  emotion,
  secondaryEmotion,
  intensity,
  content,
  locationCity,
  weatherCondition,
  weatherTemp,
  timestamp,
  likesCount = 0,
  isLiked = false,
  commentsCount = 0,
  onLikePress,
  onCommentPress,
  onReportPress,
  onAuthorPress,
  style,
}) => {
  const { colors } = useTheme();
  const emotionConfig = theme.getEmotionConfig(emotion);

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      {/* Author & Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={isAnonymous ? undefined : onAuthorPress}
          style={styles.authorRow}
        >
          <Avatar
            source={isAnonymous ? null : authorAvatar}
            name={isAnonymous ? '?' : authorName}
            size="md"
            emotion={emotion}
          />
          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Typography variant="title" numberOfLines={1}>
                {isAnonymous ? 'Anonymous' : authorName}
              </Typography>
              {isAnonymous && (
                <View style={[styles.anonymousBadge, { backgroundColor: colors.surfaceHighlight }]}>
                  <Typography variant="caption" color={colors.textMuted}>
                    Incognito
                  </Typography>
                </View>
              )}
            </View>

            <View style={styles.subMetaRow}>
              {auraScore !== undefined && !isAnonymous && (
                <View style={styles.auraPill}>
                  <Typography variant="caption" weight="bold" color={colors.primaryLight}>
                    ⚡ {auraScore} Aura
                  </Typography>
                </View>
              )}
              <Typography variant="caption" color={colors.textMuted}>
                {timestamp}
              </Typography>
            </View>
          </View>
        </TouchableOpacity>

        {onReportPress && (
          <IconButton
            icon={<Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />}
            size="sm"
            variant="ghost"
            onPress={onReportPress}
          />
        )}
      </View>

      {/* Mood Tag Bar */}
      <View style={styles.moodBar}>
        <MoodTag
          emotion={emotion}
          secondaryEmotion={secondaryEmotion}
          intensity={intensity}
          size="md"
        />

        {locationCity && (
          <View style={styles.locationTag}>
            <Ionicons name="location-outline" size={14} color={colors.textMuted} />
            <Typography variant="caption" color={colors.textSecondary} style={styles.locationText}>
              {locationCity}
              {weatherTemp !== undefined ? ` • ${weatherTemp}°C` : ''}
              {weatherCondition ? ` ${weatherCondition}` : ''}
            </Typography>
          </View>
        )}
      </View>

      {/* Content Text */}
      {content ? (
        <Typography variant="body" style={[styles.content, { color: colors.textPrimary }]}>
          {content}
        </Typography>
      ) : null}

      {/* Footer Actions */}
      <View style={[styles.footer, { borderTopColor: colors.border }]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLikePress}
          style={styles.actionBtn}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? colors.error : colors.textSecondary}
          />
          <Typography
            variant="bodySmall"
            weight={isLiked ? 'semibold' : 'regular'}
            color={isLiked ? colors.error : colors.textSecondary}
            style={styles.actionCount}
          >
            {likesCount} {likesCount === 1 ? 'Support' : 'Supports'}
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onCommentPress}
          style={styles.actionBtn}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={colors.textSecondary}
          />
          <Typography
            variant="bodySmall"
            color={colors.textSecondary}
            style={styles.actionCount}
          >
            {commentsCount} {commentsCount === 1 ? 'Comment' : 'Comments'}
          </Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  authorMeta: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousBadge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  auraPill: {
    marginRight: 8,
  },
  moodBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  locationTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
  },
  content: {
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: theme.spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  actionCount: {
    marginLeft: 6,
  },
});
