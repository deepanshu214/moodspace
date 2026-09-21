import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { inkFor } from '@/theme/colors';
import { Typography } from '../common/Typography';

export interface AuraDisplayProps {
  score: number;
  variant?: 'compact' | 'badge' | 'card';
  style?: ViewStyle;
}

export const AuraDisplay: React.FC<AuraDisplayProps> = ({
  score,
  variant = 'compact',
  style,
}) => {
  const { colors, isDark } = useTheme();
  const getTier = (pts: number) => {
    if (pts >= 1000) return { title: 'Luminary', color: '#FF5C38', emoji: '🌟' };
    if (pts >= 500) return { title: 'Empath', color: colors.accentInk, emoji: '💜' };
    if (pts >= 200) return { title: 'Guide', color: colors.accent, emoji: '✨' };
    if (pts >= 50) return { title: 'Seeker', color: colors.success, emoji: '🌱' };
    return { title: 'Novice', color: colors.textMuted, emoji: '💫' };
  };

  const tier = getTier(score);

  if (variant === 'compact') {
    return (
      <View style={[styles.compactContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, style]}>
        <Typography variant="bodySmall" style={styles.emoji}>
          {tier.emoji}
        </Typography>
        <Typography variant="caption" weight="bold" color={inkFor(tier.color, isDark)}>
          {score} Aura
        </Typography>
      </View>
    );
  }

  if (variant === 'badge') {
    return (
      <View
        style={[
          styles.badgeContainer,
          { borderColor: tier.color, backgroundColor: colors.surfaceElevated },
          style,
        ]}
      >
        <Typography variant="bodySmall" style={styles.emoji}>
          {tier.emoji}
        </Typography>
        <Typography variant="caption" weight="bold" color={colors.textPrimary}>
          {score}
        </Typography>
        <Typography variant="caption" color={inkFor(tier.color, isDark)} style={styles.tierName}>
          {tier.title}
        </Typography>
      </View>
    );
  }

  // Card variant
  return (
    <View style={[styles.cardContainer, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, style]}>
      <View style={[styles.glowRing, { backgroundColor: colors.surface, borderColor: tier.color }]}>
        <Typography variant="h2" weight="bold" color={inkFor(tier.color, isDark)}>
          {score}
        </Typography>
        <Typography variant="caption" color={colors.textSecondary}>
          Aura Points
        </Typography>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.tierPill}>
          <Typography variant="caption" weight="bold" color={inkFor(tier.color, isDark)}>
            {tier.emoji} {tier.title}
          </Typography>
        </View>
        <Typography variant="caption" color={colors.textMuted} style={styles.auraDesc}>
          Earned through supportive comments and genuine emotional presence.
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  emoji: {
    marginRight: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  tierName: {
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
  },
  glowRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMeta: {
    flex: 1,
    marginLeft: theme.spacing.lg,
  },
  tierPill: {
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  auraDesc: {
    lineHeight: 16,
  },
});
