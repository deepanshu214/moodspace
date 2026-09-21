import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/context';
import { getEmotionConfig, emotionInk } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { haptics } from '@/theme/haptics';

interface EmotionBar {
  emotion: string;
  percentage: number;
}

interface MoodPulseCardProps {
  /** Array of emotion percentages to display */
  data: EmotionBar[];
  /** Called when user taps an emotion segment */
  onEmotionPress?: (emotion: string) => void;
  /** Relative freshness label, e.g. "3m" */
  updatedAgo?: string;
  /** Heading; the window this spectrum covers. */
  title?: string;
}

/** One segment of the stacked spectrum bar. */
const Segment: React.FC<{
  emotion: string;
  percentage: number;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onPress?: () => void;
}> = ({ emotion, percentage, index, isFirst, isLast, onPress }) => {
  const config = getEmotionConfig(emotion);
  const grow = useSharedValue(0);

  useEffect(() => {
    grow.value = withDelay(index * 90, withSpring(percentage, { damping: 16, stiffness: 110, mass: 0.8 }));
  }, [percentage, index]);

  const style = useAnimatedStyle(() => ({ width: `${grow.value}%` }));

  return (
    <Animated.View style={style}>
      <Pressable
        onPress={() => {
          haptics.light();
          onPress?.();
        }}
        accessibilityRole="button"
        accessibilityLabel={`${config.label} ${Math.round(percentage)} percent`}
        style={[
          styles.segment,
          {
            backgroundColor: config.primary,
            borderLeftWidth: isFirst ? 0 : 2,
            borderTopLeftRadius: isFirst ? 6 : 0,
            borderBottomLeftRadius: isFirst ? 6 : 0,
            borderTopRightRadius: isLast ? 6 : 0,
            borderBottomRightRadius: isLast ? 6 : 0,
          },
        ]}
      >
        {percentage >= 14 && (
          <Typography variant="overline" style={styles.segmentLabel}>
            {Math.round(percentage)}%
          </Typography>
        )}
      </Pressable>
    </Animated.View>
  );
};

/**
 * MoodPulseCard — "24h Emotional Spectrum": a stacked pigment bar with a
 * legend, matching the Stitch home screen.
 */
export const MoodPulseCard: React.FC<MoodPulseCardProps> = ({
  data,
  onEmotionPress,
  updatedAgo = '3m',
  title = '24h Emotional Spectrum',
}) => {
  const { colors, isDark } = useTheme();
  const total = data.reduce((sum, d) => sum + d.percentage, 0) || 1;
  const normalised = data.map((d) => ({ ...d, percentage: (d.percentage / total) * 100 }));

  return (
    <Tactile offset={4} radius={24} contentStyle={styles.card}>
      <View style={styles.header}>
        <Typography variant="h4" style={{ color: colors.textPrimary }}>
          {title}
        </Typography>
        <Typography variant="overline" style={{ color: colors.textMuted }}>
          UPDATED {updatedAgo} AGO
        </Typography>
      </View>

      <View style={[styles.bar, { borderColor: colors.ink }]}>
        {normalised.map((item, i) => (
          <Segment
            key={item.emotion}
            emotion={item.emotion}
            percentage={item.percentage}
            index={i}
            isFirst={i === 0}
            isLast={i === normalised.length - 1}
            onPress={() => onEmotionPress?.(item.emotion)}
          />
        ))}
      </View>

      <View style={styles.legend}>
        {normalised.map((item) => {
          const config = getEmotionConfig(item.emotion);
          return (
            <Pressable
              key={item.emotion}
              onPress={() => onEmotionPress?.(item.emotion)}
              style={styles.legendItem}
              accessibilityRole="button"
            >
              <MoodGlyph mood={toMoodKey(item.emotion)} size={14} color={emotionInk(config, isDark)} />
              <Typography variant="caption" style={{ color: colors.textSecondary, marginLeft: 5 }}>
                {config.label}
              </Typography>
            </Pressable>
          );
        })}
      </View>
    </Tactile>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  bar: {
    flexDirection: 'row',
    height: 26,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftColor: '#1E1E1E',
  },
  segmentLabel: {
    color: '#1E1E1E',
    fontSize: 9,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 14,
    marginTop: 4,
  },
});
