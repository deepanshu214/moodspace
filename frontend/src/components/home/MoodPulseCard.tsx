import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context';
import { colors, springs, shadows, getEmotionConfig } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';

interface EmotionBar {
  emotion: string;
  percentage: number;
}

interface MoodPulseCardProps {
  /** Array of emotion percentages to display */
  data: EmotionBar[];
  /** Called when user taps an emotion bar */
  onEmotionPress?: (emotion: string) => void;
}

const AnimatedBar: React.FC<{
  emotion: string;
  percentage: number;
  index: number;
  onPress?: () => void;
}> = ({ emotion, percentage, index, onPress }) => {
  const { colors, isDark } = useTheme();
  const barWidth = useSharedValue(0);
  const scale = useSharedValue(1);
  const config = getEmotionConfig(emotion);

  useEffect(() => {
    barWidth.value = withDelay(
      index * 100,
      withSpring(percentage, { damping: 16, stiffness: 100, mass: 0.8 })
    );
  }, [percentage, index]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springs.stiff);
    haptics.light();
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springs.stiff);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.barRow}
    >
      <View style={styles.barLabel}>
        <Typography variant="caption" style={{ color: colors.textSecondary }}>
          {config.emoji}
        </Typography>
        <Typography variant="caption" weight="medium" style={{ color: colors.textSecondary, marginLeft: 6 }}>
          {config.label}
        </Typography>
      </View>
      <View style={[styles.barTrack, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' }]}>
        <Animated.View style={[styles.barFillContainer, barStyle]}>
          <LinearGradient
            colors={config.gradientPair}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.barFill}
          />
        </Animated.View>
      </View>
      <Typography
        variant="caption"
        weight="semibold"
        style={{ color: colors.textPrimary, width: 36, textAlign: 'right' }}
      >
        {Math.round(percentage)}%
      </Typography>
    </Pressable>
  );
};

/**
 * MoodPulseCard — Glass hero card with animated emotion distribution bars
 */
export const MoodPulseCard: React.FC<MoodPulseCardProps> = ({ data, onEmotionPress }) => {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { borderColor: colors.glass.border }, shadows.glassGlow(colors.primary, 0.12)]}>
      <BlurView tint={isDark ? 'dark' : 'light'} intensity={25} style={styles.blur}>
        <View style={[styles.content, { backgroundColor: colors.glass.surface }]}>
          <View style={styles.header}>
            <View>
              <Typography variant="caption" weight="bold" style={{ color: colors.accentInk, letterSpacing: 0.5 }}>
                COMMUNITY RHYTHM
              </Typography>
              <Typography variant="caption" style={{ color: colors.textMuted, marginTop: 2 }}>
                What we're feeling together right now
              </Typography>
            </View>
            <Typography variant="caption" weight="semibold" style={{ color: colors.secondary }}>
              Live ✨
            </Typography>
          </View>
          {data.map((item, index) => (
            <AnimatedBar
              key={item.emotion}
              emotion={item.emotion}
              percentage={item.percentage}
              index={index}
              onPress={() => onEmotionPress?.(item.emotion)}
            />
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    padding: 20,
    backgroundColor: colors.glass.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  barLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFillContainer: {
    height: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    flex: 1,
    borderRadius: 4,
  },
});
