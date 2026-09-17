import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Ionicons } from '@expo/vector-icons';
import { Icebreaker, IcebreakerCategory } from '@/api/types';

interface IcebreakerCardProps {
  icebreaker: Icebreaker;
  onSelect: (icebreaker: Icebreaker) => void;
  onRefresh?: () => void;
  isSelected?: boolean;
}

const CATEGORY_META: Record<IcebreakerCategory, { icon: string; color: string }> = {
  curiosity:  { icon: 'telescope-outline',     color: '#A29BFE' },
  gratitude:  { icon: 'leaf-outline',          color: '#86EFAC' },
  empathy:    { icon: 'heart-half-outline',     color: '#FF6B8A' },
  growth:     { icon: 'trending-up-outline',    color: '#FFD166' },
  presence:   { icon: 'eye-outline',           color: '#7FB5FF' },
  reflection: { icon: 'water-outline',         color: '#C4B5D4' },
};

export const IcebreakerCard: React.FC<IcebreakerCardProps> = ({
  icebreaker,
  onSelect,
  onRefresh,
  isSelected,
}) => {
  const { colors } = useTheme();
  const meta = CATEGORY_META[icebreaker.category] ?? {
    icon: 'chatbubble-outline',
    color: colors.accentInk,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onSelect(icebreaker)}
      style={[
        styles.card,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        isSelected && { borderColor: colors.success, backgroundColor: 'rgba(0, 184, 148, 0.06)' },
      ]}
    >
      {/* Category pill */}
      <View style={[styles.categoryPill, { backgroundColor: meta.color + '20' }]}>
        <Ionicons name={meta.icon as any} size={12} color={meta.color} />
        <Typography
          variant="caption"
          color={meta.color}
          style={styles.categoryText}
        >
          {icebreaker.category}
        </Typography>
      </View>

      {/* Prompt */}
      <Typography
        variant="bodySmall"
        color={colors.textPrimary}
        style={styles.prompt}
      >
        "{icebreaker.prompt}"
      </Typography>

      {/* Follow-up hint */}
      {icebreaker.follow_up && (
        <Typography
          variant="caption"
          color={colors.textMuted}
          style={styles.followUp}
        >
          Follow-up: {icebreaker.follow_up}
        </Typography>
      )}

      {/* Emotion tags */}
      {icebreaker.emotion_tags.length > 0 && (
        <View style={styles.tagsRow}>
          {icebreaker.emotion_tags.slice(0, 3).map((tag) => {
            const cfg = theme.getEmotionConfig(tag);
            return (
              <View
                key={tag}
                style={[styles.emotionTag, { backgroundColor: cfg.background }]}
              >
                <Typography variant="caption" color={cfg.primary} style={styles.tagText}>
                  {cfg.emoji} {cfg.label}
                </Typography>
              </View>
            );
          })}
        </View>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <View style={styles.selectedBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Typography variant="caption" color={colors.success} style={styles.selectedText}>
            Selected
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
    alignSelf: 'flex-start',
  },
  categoryText: {
    textTransform: 'capitalize',
    fontSize: 11,
  },
  prompt: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  followUp: {
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  emotionTag: {
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  selectedText: {
    fontSize: 11,
  },
});
