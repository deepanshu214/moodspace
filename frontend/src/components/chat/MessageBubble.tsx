import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { emotionInk } from '@/theme/colors';
import { Typography } from '@/components/common/Typography';
import { Ionicons } from '@expo/vector-icons';
import { DirectMessage, MessageReactionResponse } from '@/api/types';

interface MessageBubbleProps {
  message: DirectMessage;
  isMe: boolean;
  /** Tap opens the reaction picker — long-press alone was undiscoverable. */
  onPress?: (message: DirectMessage) => void;
  onLongPress?: (message: DirectMessage) => void;
  onReactionPress?: (message: DirectMessage) => void;
  currentUserId?: string;
}

function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function groupReactions(
  reactions: MessageReactionResponse[],
): Record<string, number> {
  return reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMe,
  onPress,
  onLongPress,
  onReactionPress,
}) => {
  const { colors, isDark } = useTheme();
  const isIcebreaker = message.message_type === 'icebreaker';
  const isMoodShare = message.message_type === 'mood_share';
  const isDeleted = message.is_deleted;

  const emotionCfg = message.emotion_tag
    ? theme.getEmotionConfig(message.emotion_tag)
    : null;

  const reactionGroups = groupReactions(message.reactions ?? []);
  const hasReactions = Object.keys(reactionGroups).length > 0;

  return (
    <View style={[styles.wrapper, isMe ? styles.wrapperMe : styles.wrapperOther]}>
      {/* Icebreaker header */}
      {isIcebreaker && !isDeleted && (
        <View style={styles.icebreakerHeader}>
          <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.accentInk} />
          <Typography variant="caption" color={colors.accentInk} style={styles.icebreakerLabel}>
            Icebreaker
          </Typography>
        </View>
      )}

      {/* Mood share header */}
      {isMoodShare && !isDeleted && emotionCfg && (
        <View style={[styles.moodHeader, { backgroundColor: emotionCfg.background }]}>
          <Typography variant="caption" color={emotionInk(emotionCfg, isDark)}>
            {emotionCfg.emoji} Shared their mood · {emotionCfg.label}
          </Typography>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress?.(message)}
        onLongPress={() => onLongPress?.(message)}
        delayLongPress={350}
        accessibilityRole="button"
        accessibilityLabel={isDeleted ? 'Deleted message' : 'Message. Tap to react'}
        style={[
          styles.bubble,
          isMe
            ? { backgroundColor: colors.primary }
            : { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
          isIcebreaker && styles.bubbleIcebreaker,
          isMoodShare && emotionCfg && {
            borderLeftWidth: 3,
            borderLeftColor: emotionCfg.primary,
          },
          isDeleted && styles.bubbleDeleted,
        ]}
      >
        <Typography
          variant="body"
          color={isDeleted
            ? colors.textMuted
            : isMe
              ? '#FFFFFF'
              : colors.textPrimary}
          style={isDeleted ? styles.deletedText : undefined}
        >
          {isDeleted ? '🚫 Message deleted' : message.content}
        </Typography>

        {/* Status + time row */}
        <View style={styles.metaRow}>
          <Typography
            variant="caption"
            color={isMe ? 'rgba(255, 255, 255, 0.65)' : colors.textMuted}
            style={styles.time}
          >
            {formatMessageTime(message.created_at)}
          </Typography>

          {isMe && !isDeleted && (
            <View style={styles.statusIcon}>
              {message.status === 'sending' && (
                <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.5)" />
              )}
              {message.status === 'sent' && (
                <Ionicons name="checkmark-outline" size={12} color="rgba(255,255,255,0.6)" />
              )}
              {(message.status === 'delivered' || message.status === 'read') && (
                <Ionicons name="checkmark-done-outline" size={12}
                  color={message.status === 'read' ? colors.primaryLight : 'rgba(255,255,255,0.6)'} />
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Emoji reactions row */}
      {hasReactions && (
        <TouchableOpacity
          onPress={() => onReactionPress?.(message)}
          style={[styles.reactionsRow, isMe && styles.reactionsRowMe]}
        >
          {Object.entries(reactionGroups).map(([emoji, count]) => (
            <View key={emoji} style={[styles.reactionPill, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
              <Typography variant="caption">{emoji}</Typography>
              {count > 1 && (
                <Typography variant="caption" color={colors.textSecondary} style={styles.reactionCount}>
                  {count}
                </Typography>
              )}
            </View>
          ))}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  wrapperMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperOther: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  icebreakerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    paddingHorizontal: 4,
    gap: 4,
  },
  icebreakerLabel: {
    fontSize: 11,
  },
  moodHeader: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginBottom: 4,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.lg,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleIcebreaker: {
    borderStyle: 'dashed',
  },
  bubbleDeleted: {
    opacity: 0.6,
  },
  deletedText: {
    fontStyle: 'italic',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 10,
  },
  statusIcon: {
    marginLeft: 2,
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  reactionsRowMe: {
    justifyContent: 'flex-end',
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    gap: 3,
  },
  reactionCount: {
    fontSize: 11,
  },
});
