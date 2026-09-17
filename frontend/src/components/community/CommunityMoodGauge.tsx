import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';

export interface MoodDistributionItem {
  emotion: string;
  percentage: number;
}

export interface CommunityMoodGaugeProps {
  dominantEmotion?: string;
  resonanceScore?: number;
  distribution?: MoodDistributionItem[];
  style?: ViewStyle;
}

const DEFAULT_DISTRIBUTION: MoodDistributionItem[] = [
  { emotion: 'calm', percentage: 65 },
  { emotion: 'joy', percentage: 20 },
  { emotion: 'love', percentage: 10 },
  { emotion: 'anxiety', percentage: 5 },
];

export const CommunityMoodGauge: React.FC<CommunityMoodGaugeProps> = ({
  dominantEmotion = 'calm',
  resonanceScore = 88,
  distribution = DEFAULT_DISTRIBUTION,
  style,
}) => {
  const { colors } = useTheme();
  const config = theme.getEmotionConfig(dominantEmotion);

  return (
    <View style={[styles.container, style]}>
      {/* Header: Dominant Atmosphere & Resonance Rating */}
      <View style={styles.headerRow}>
        <View style={styles.dominantPill}>
          <Typography variant="bodySmall">{config.emoji}</Typography>
          <Typography
            variant="caption"
            weight="bold"
            color={config.primary}
            style={styles.dominantText}
          >
            Atmosphere: {config.label}
          </Typography>
        </View>

        <View style={styles.scorePill}>
          <Typography variant="caption" weight="bold" color="#FFFFFF">
            Resonance: {resonanceScore}%
          </Typography>
        </View>
      </View>

      {/* Multi-segment Emotional Climate Bar */}
      <View style={styles.gaugeTrack}>
        {distribution.map((item, idx) => {
          const itemConfig = theme.getEmotionConfig(item.emotion);
          return (
            <View
              key={`${item.emotion}-${idx}`}
              style={[
                styles.gaugeSegment,
                {
                  width: `${item.percentage}%`,
                  backgroundColor: itemConfig.primary,
                },
              ]}
            />
          );
        })}
      </View>

      {/* Legend Breakdown */}
      <View style={styles.legendRow}>
        {distribution.slice(0, 4).map((item, idx) => {
          const itemConfig = theme.getEmotionConfig(item.emotion);
          return (
            <View key={`${item.emotion}-legend-${idx}`} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: itemConfig.primary }]} />
              <Typography variant="caption" color={colors.textMuted}>
                {itemConfig.label} {item.percentage}%
              </Typography>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dominantPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dominantText: {
    textTransform: 'capitalize',
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  gaugeTrack: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  gaugeSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
