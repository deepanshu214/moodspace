import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Share, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { emotionInk, inkFor } from '@/theme/colors';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Card } from '../common/Card';
import { MoodTag } from '../mood/MoodTag';
import { AuraDisplay } from './AuraDisplay';
import { ReactionFloater } from '../mood/ReactionFloater';
import { haptics } from '@/theme/haptics';
import { useReact } from '@/hooks/useSocial';
import { Ionicons } from '@expo/vector-icons';

export interface FeedCardProps {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string | null;
  auraScore?: number;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content: string;
  locationCity?: string;
  weatherCondition?: string;
  weatherTemp?: number;
  timestamp: string;
  reactionsCount?: number;
  commentsCount?: number;
  isAnonymous?: boolean;
  onPress?: () => void;
  onAuthorPress?: () => void;
  onCommentPress?: () => void;
  style?: ViewStyle;
}

const REACTIONS = [
  { type: 'heart' as const, label: 'Support', icon: 'heart', emoji: '❤️', color: '#F87171' },
  { type: 'hug' as const, label: 'Hug', icon: 'hand-left', emoji: '🤗', color: '#FF5C38' },
  { type: 'empathy' as const, label: 'With You', icon: 'water', emoji: '🌊', color: '#60A5FA' },
  { type: 'celebrate' as const, label: 'Joy', icon: 'sparkles', emoji: '✨', color: '#FF5C38' },
];

export const FeedCard: React.FC<FeedCardProps> = ({
  id,
  authorId,
  authorName,
  authorAvatar,
  auraScore,
  emotion,
  secondaryEmotion,
  intensity,
  content,
  locationCity,
  weatherCondition,
  weatherTemp,
  timestamp,
  reactionsCount = 0,
  commentsCount = 0,
  isAnonymous = false,
  onPress,
  onAuthorPress,
  onCommentPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const [activeReaction, setActiveReaction] = useState<string | null>(null);
  const [totalReactions, setTotalReactions] = useState(reactionsCount);
  const [floaterKey, setFloaterKey] = useState(0);
  const [floaterEmoji, setFloaterEmoji] = useState('❤️');
  const { mutate: sendReaction } = useReact();

  const handleReactionPress = (rx: typeof REACTIONS[0]) => {
    haptics.light();
    if (activeReaction === rx.type) {
      setActiveReaction(null);
      setTotalReactions((prev) => Math.max(0, prev - 1));
    } else {
      setActiveReaction(rx.type);
      setFloaterEmoji(rx.emoji);
      setFloaterKey(Date.now());
      setTotalReactions((prev) => (activeReaction ? prev : prev + 1));
      sendReaction({
        target_type: 'checkin',
        target_id: id,
        reaction_type: rx.type,
      });
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${content}" — an emotional reflection on MoodSpace shared with ${emotion} resonance.`,
      });
    } catch (e) {
      // Ignored
    }
  };

  const emotionConfig = theme.getEmotionConfig(emotion);

  return (
    <Card variant="elevated" style={[styles.card, style]}>
      {/* Header: Author Info & Aura Badge */}
      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={isAnonymous ? 1 : 0.75}
          onPress={isAnonymous ? undefined : onAuthorPress}
          style={styles.authorRow}
        >
          {isAnonymous ? (
            <View style={styles.anonAvatar}>
              <Typography variant="body">👻</Typography>
            </View>
          ) : (
            <Avatar
              source={authorAvatar}
              name={authorName}
              size="md"
              emotion={emotion}
            />
          )}

          <View style={styles.authorTexts}>
            <View style={styles.nameRow}>
              <Typography variant="body" weight="bold" color={colors.textPrimary}>
                {isAnonymous ? 'Anonymous Friend' : authorName}
              </Typography>
              {isAnonymous && (
                <View style={styles.incognitoBadge}>
                  <Typography variant="caption" color={inkFor('#C084FC', isDark)}>
                    Private
                  </Typography>
                </View>
              )}
            </View>

            <View style={styles.subMeta}>
              <Typography variant="caption" color={colors.textMuted}>
                {timestamp}
              </Typography>
              {locationCity && (
                <Typography variant="caption" color={colors.textSecondary}>
                  • 📍 {locationCity}
                </Typography>
              )}
            </View>
          </View>
        </TouchableOpacity>

        {!isAnonymous && auraScore !== undefined && (
          <AuraDisplay score={auraScore} variant="compact" />
        )}
      </View>

      {/* Weather Capsule (if available) */}
      {(weatherCondition || weatherTemp !== undefined) && (
        <View style={styles.weatherCapsule}>
          <Ionicons name="cloud-outline" size={13} color={emotionInk(emotionConfig, isDark)} />
          <Typography variant="caption" color={colors.textSecondary}>
            {weatherCondition || 'Calm skies'}
            {weatherTemp !== undefined ? ` • ${weatherTemp}°C` : ''}
          </Typography>
        </View>
      )}

      {/* Mood Tag Bar */}
      <View style={styles.moodBar}>
        <MoodTag
          emotion={emotion}
          secondaryEmotion={secondaryEmotion}
          intensity={intensity}
          size="sm"
        />
      </View>

      {/* Main Post Reflection */}
      <TouchableOpacity
        activeOpacity={onPress ? 0.8 : 1}
        onPress={onPress}
        style={styles.contentArea}
      >
        <Typography
          variant="body"
          color={colors.textPrimary}
          style={styles.reflectionText}
        >
          {content}
        </Typography>
      </TouchableOpacity>

      {/* Empathy Reaction Bar */}
      <View style={styles.empathyBar}>
        {REACTIONS.map((rx) => {
          const isSelected = activeReaction === rx.type;
          return (
            <TouchableOpacity
              key={rx.type}
              activeOpacity={0.7}
              onPress={() => handleReactionPress(rx)}
              style={[
                styles.reactionPill,
                isSelected && {
                  backgroundColor: `${rx.color}28`,
                  borderColor: rx.color,
                },
              ]}
            >
              {isSelected && (
                <ReactionFloater emoji={floaterEmoji} triggerKey={floaterKey} />
              )}
              <Typography style={{ fontSize: 13, marginRight: 4 }}>{rx.emoji}</Typography>
              <Typography
                variant="caption"
                weight={isSelected ? 'bold' : 'medium'}
                color={isSelected ? inkFor(rx.color, isDark) : colors.textSecondary}
              >
                {rx.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer Stats & Actions */}
      <View style={styles.footer}>
        <View style={styles.statsSummary}>
          <Typography variant="caption" color={colors.textMuted}>
            {totalReactions} Resonances • {commentsCount} Echoes
          </Typography>
        </View>

        <View style={styles.footerBtns}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onCommentPress || onPress}
            style={styles.iconBtn}
          >
            <Ionicons name="chatbubble-outline" size={17} color={colors.textSecondary} />
            <Typography variant="caption" color={colors.textSecondary}>
              Echo
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleShare}
            style={styles.iconBtn}
          >
            <Ionicons name="share-outline" size={17} color={colors.textSecondary} />
            <Typography variant="caption" color={colors.textSecondary}>
              Share
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(28, 30, 36, 0.92)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  anonAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(192, 132, 252, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorTexts: {
    gap: 2,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  incognitoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherCapsule: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 8,
    gap: 4,
  },
  moodBar: {
    marginBottom: 10,
  },
  contentArea: {
    marginBottom: 14,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  empathyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    position: 'relative',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsSummary: {},
  footerBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
