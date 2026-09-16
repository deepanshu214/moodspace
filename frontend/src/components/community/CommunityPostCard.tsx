import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { MoodTag } from '../mood/MoodTag';
import { Ionicons } from '@expo/vector-icons';

export interface CommunityPostCardProps {
  id: string;
  authorName?: string;
  authorAvatar?: string | null;
  title?: string;
  content: string;
  emotion?: string;
  isAnonymous?: boolean;
  hasContentWarning?: boolean;
  isPinned?: boolean;
  likesCount?: number;
  commentsCount?: number;
  timestamp: string;
  onPress?: () => void;
  onLikePress?: () => void;
  style?: ViewStyle;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  id,
  authorName = 'Circle Seeker',
  authorAvatar,
  title,
  content,
  emotion = 'calm',
  isAnonymous = false,
  hasContentWarning = false,
  isPinned = false,
  likesCount = 0,
  commentsCount = 0,
  timestamp,
  onPress,
  onLikePress,
  style,
}) => {
  const [revealed, setRevealed] = useState(!hasContentWarning);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(likesCount);

  const handleToggleLike = () => {
    if (liked) {
      setLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
    } else {
      setLiked(true);
      setLikes((prev) => prev + 1);
      onLikePress?.();
    }
  };

  const displayName = isAnonymous ? 'Anonymous Member' : authorName;
  const emotionConfig = theme.getEmotionConfig(emotion);

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      {/* Pinned Indicator Header (if pinned) */}
      {isPinned && (
        <View style={styles.pinnedBanner}>
          <Ionicons name="pin" size={12} color={theme.colors.accent} />
          <Typography variant="caption" weight="bold" color={theme.colors.accent}>
            Pinned Guideline
          </Typography>
        </View>
      )}

      {/* Author Row */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          {isAnonymous ? (
            <View style={styles.anonAvatar}>
              <Typography variant="caption">👻</Typography>
            </View>
          ) : (
            <Avatar source={authorAvatar} name={displayName} size="sm" emotion={emotion} />
          )}

          <View style={styles.authorMeta}>
            <View style={styles.nameRow}>
              <Typography variant="bodySmall" weight="bold" color={theme.colors.textPrimary}>
                {displayName}
              </Typography>
              {isAnonymous && (
                <View style={styles.incognitoBadge}>
                  <Typography variant="caption" color="#A29BFE">
                    Private
                  </Typography>
                </View>
              )}
            </View>

            <Typography variant="caption" color={theme.colors.textMuted}>
              {timestamp}
            </Typography>
          </View>
        </View>

        {emotion && (
          <MoodTag emotion={emotion} size="sm" />
        )}
      </View>

      {/* Title (if present) */}
      {title ? (
        <Typography variant="title" weight="bold" color={theme.colors.textPrimary} style={styles.title}>
          {title}
        </Typography>
      ) : null}

      {/* Content or Content Warning Shield */}
      {hasContentWarning && !revealed ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setRevealed(true)}
          style={styles.warningShield}
        >
          <Ionicons name="shield-outline" size={18} color={theme.colors.warning} />
          <View style={styles.warningTexts}>
            <Typography variant="caption" weight="bold" color={theme.colors.warning}>
              Content Note: Sensitive Themes
            </Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Tap to unveil this reflection gently.
            </Typography>
          </View>
        </TouchableOpacity>
      ) : (
        <Typography variant="body" color={theme.colors.textPrimary} style={styles.content}>
          {content}
        </Typography>
      )}

      {/* Footer Reaction Row */}
      <View style={styles.footer}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleToggleLike}
          style={[
            styles.reactionBtn,
            liked && { backgroundColor: 'rgba(253, 121, 168, 0.15)', borderColor: '#FD79A8' },
          ]}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={16}
            color={liked ? '#FD79A8' : theme.colors.textMuted}
          />
          <Typography
            variant="caption"
            weight={liked ? 'bold' : 'medium'}
            color={liked ? '#FD79A8' : theme.colors.textSecondary}
          >
            {likes} Support
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          style={styles.commentBtn}
        >
          <Ionicons name="chatbubble-outline" size={15} color={theme.colors.textMuted} />
          <Typography variant="caption" color={theme.colors.textSecondary}>
            {commentsCount} Echoes
          </Typography>
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(17, 20, 34, 0.88)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  pinnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  anonAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(162, 155, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(162, 155, 254, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorMeta: {
    gap: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incognitoBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: 'rgba(162, 155, 254, 0.15)',
  },
  title: {
    marginBottom: 6,
  },
  content: {
    lineHeight: 22,
    marginBottom: 10,
  },
  warningShield: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 234, 167, 0.08)',
    padding: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 234, 167, 0.25)',
    marginBottom: 10,
  },
  warningTexts: {
    gap: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 8,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  commentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
