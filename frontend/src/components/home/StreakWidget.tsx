import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  useAnimatedStyle,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { colors, shadows } from '@/theme';
import { Typography } from '@/components/common/Typography';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface StreakWidgetProps {
  currentStreak: number;
  maxStreak?: number; // for the ring progress (default 30 days)
}

/**
 * StreakWidget — compact glass card with animated circular progress ring + flame emoji
 */
export const StreakWidget: React.FC<StreakWidgetProps> = ({
  currentStreak,
  maxStreak = 30,
}) => {
  const progress = useSharedValue(0);
  const flameScale = useSharedValue(1);

  const ringSize = 72;
  const strokeWidth = 4;
  const radius = (ringSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const targetProgress = Math.min(currentStreak / maxStreak, 1);
    progress.value = withDelay(
      300,
      withTiming(targetProgress, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      })
    );

    // Flame breathing animation
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, [currentStreak, maxStreak]);

  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [{ scale: flameScale.value }],
  }));

  // Bigger flame for longer streaks
  const flameEmoji = currentStreak >= 14 ? '🔥' : currentStreak >= 7 ? '🔥' : '✨';
  const flameSize = currentStreak >= 14 ? 28 : currentStreak >= 7 ? 24 : 20;

  return (
    <View style={[styles.container, shadows.glassGlow(colors.accent, 0.12)]}>
      <BlurView tint="dark" intensity={25} style={styles.blur}>
        <View style={styles.content}>
          <View style={styles.ringContainer}>
            <Svg width={ringSize} height={ringSize} style={styles.svg}>
              {/* Background track */}
              <Circle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Animated progress */}
              <AnimatedCircle
                cx={ringSize / 2}
                cy={ringSize / 2}
                r={radius}
                stroke={colors.accent}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animatedProps={animatedCircleProps}
                rotation={-90}
                origin={`${ringSize / 2}, ${ringSize / 2}`}
              />
            </Svg>
            <View style={styles.ringContent}>
              <Animated.View style={flameStyle}>
                <Typography style={{ fontSize: flameSize, textAlign: 'center' }}>
                  {flameEmoji}
                </Typography>
              </Animated.View>
            </View>
          </View>
          <Typography variant="stat" style={{ color: colors.textPrimary, textAlign: 'center' }}>
            {currentStreak}
          </Typography>
          <Typography variant="caption" style={{ color: colors.textMuted, textAlign: 'center' }}>
            day streak
          </Typography>
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
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.glass.surface,
  },
  ringContainer: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  svg: {
    position: 'absolute',
  },
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
