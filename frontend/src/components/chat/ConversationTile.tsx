import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Ionicons } from '@expo/vector-icons';
import { Conversation } from '@/api/types';

interface ConversationTileProps {
  conversation: Conversation;
  onPress: () => void;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  if (diffHours < 1) return 'now';
  if (diffHours < 24) return `${Math.floor(diffHours)}h`;
  if (diffDays < 7) return `${Math.floor(diffDays)}d`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export const ConversationTile: React.FC<ConversationTileProps> = ({
  conversation,
  onPress,
}) => {
  const { colors } = useTheme();
  const { other_participant, last_message, unread_count, is_echo_match, resonance_score } =
    conversation;

  const isUnread = unread_count > 0;
  const emotion = other_participant.current_emotion;
  const emotionCfg = emotion ? theme.getEmotionConfig(emotion) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isUnread && { backgroundColor: colors.surfaceElevated, borderColor: colors.borderLight },
      ]}
    >
      {/* Avatar with presence dot */}
      <Avatar
        name={other_participant.display_name}
        source={other_participant.avatar_url ?? undefined}
        size="md"
        emotion={emotion}
        showPresence
        isOnline={other_participant.is_online}
      />

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.nameRow}>
            <Typography
              variant="title"
              weight={isUnread ? 'bold' : 'medium'}
              numberOfLines={1}
              style={styles.name}
            >
              {other_participant.display_name}
            </Typography>

            {/* Echo match badge */}
            {is_echo_match && (
              <View style={styles.echoBadge}>
                <Ionicons name="sparkles" size={10} color={colors.secondary} />
                <Typography variant="caption" color={colors.secondary} style={styles.echoLabel}>
                  Echo
                </Typography>
              </View>
            )}
          </View>

          {/* Time + unread count */}
          <View style={styles.rightCol}>
            {last_message && (
              <Typography variant="caption" color={colors.textMuted}>
                {formatTime(last_message.created_at)}
              </Typography>
            )}
            {isUnread && <Badge count={unread_count} variant="secondary" />}
          </View>
        </View>

        {/* Snippet row */}
        <View style={styles.snippetRow}>
          {last_message ? (
            <>
              {last_message.message_type === 'icebreaker' && (
                <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.textMuted} style={styles.msgIcon} />
              )}
              {last_message.message_type === 'mood_share' && (
                <Ionicons name="heart-outline" size={12} color={colors.textMuted} style={styles.msgIcon} />
              )}
              <Typography
                variant="bodySmall"
                color={isUnread ? colors.textPrimary : colors.textSecondary}
                numberOfLines={1}
                style={styles.snippet}
              >
                {last_message.is_deleted ? '🚫 Message deleted' : last_message.content}
              </Typography>
            </>
          ) : (
            <Typography variant="bodySmall" color={colors.textMuted} style={styles.snippet}>
              Say hi with an icebreaker ✨
            </Typography>
          )}

          {/* Resonance score pill */}
          {resonance_score !== undefined && resonance_score > 0 && (
            <View style={[styles.resonancePill, emotionCfg && { backgroundColor: emotionCfg.background }]}>
              <Typography
                variant="caption"
                color={emotionCfg?.primary ?? colors.primaryLight}
                style={styles.resonanceText}
              >
                {resonance_score}% ✦
              </Typography>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  rowUnread: {},
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  name: {
    flexShrink: 1,
  },
  echoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(253, 121, 168, 0.12)',
    borderRadius: theme.radius.round,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  echoLabel: {
    marginLeft: 3,
    fontSize: 10,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  snippetRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  msgIcon: {
    marginRight: 4,
  },
  snippet: {
    flex: 1,
    marginRight: 6,
  },
  resonancePill: {
    borderRadius: theme.radius.round,
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  resonanceText: {
    fontSize: 10,
  },
});
