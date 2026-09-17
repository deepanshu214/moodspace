import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolate,
  SharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';

/**
 * MoodOrbLoader — an on-theme loading animation.
 *
 * A pulsing coral/gold core (the "you") orbited by four emotion-colored mood
 * bubbles on a flattened ellipse, which reads as a pseudo-3D orbit (depth via
 * scale + opacity as each bubble swings to the "front" or "back"). This is a
 * direct visual echo of MoodSpace's core loop — bubbles drifting around a
 * living globe — used anywhere the app is waiting on something, instead of a
 * generic spinner.
 */

export interface MoodOrbLoaderProps {
  size?: number;
  message?: string;
  style?: StyleProp<ViewStyle>;
}

const ORBIT_DOTS: { emoji: string; colorKey: 'joy' | 'calm' | 'love' | 'excitement' }[] = [
  { emoji: '☀️', colorKey: 'joy' },
  { emoji: '🌿', colorKey: 'calm' },
  { emoji: '💖', colorKey: 'love' },
  { emoji: '🎉', colorKey: 'excitement' },
];

const OrbitDot: React.FC<{
  index: number;
  total: number;
  angle: SharedValue<number>;
  radius: number;
  color: string;
  emoji: string;
}> = ({ index, total, angle, radius, color, emoji }) => {
  const dotStyle = useAnimatedStyle(() => {
    const phase = angle.value + (index * (Math.PI * 2)) / total;
    const x = Math.cos(phase) * radius;
    // Flattened vertical swing = the ellipse that reads as a 3D orbit
    const y = Math.sin(phase) * radius * 0.4;
    const depth = (Math.sin(phase) + 1) / 2; // 0 = back of orbit, 1 = front
    const scale = interpolate(depth, [0, 1], [0.55, 1.1]);
    return {
      transform: [{ translateX: x }, { translateY: y }, { scale }],
      opacity: interpolate(depth, [0, 1], [0.45, 1]),
      zIndex: Math.round(depth * 10),
    };
  });

  return (
    <Animated.View style={[styles.orbitDot, { backgroundColor: color }, dotStyle]}>
      <Typography variant="bodySmall">{emoji}</Typography>
    </Animated.View>
  );
};

export const MoodOrbLoader: React.FC<MoodOrbLoaderProps> = ({ size = 120, message, style }) => {
  const { colors } = useTheme();
  const angle = useSharedValue(0);
  const corePulse = useSharedValue(0.92);
  const coreGlowOpacity = useSharedValue(0.4);

  useEffect(() => {
    angle.value = withRepeat(withTiming(Math.PI * 2, { duration: 3600, easing: Easing.linear }), -1, false);
    corePulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 850, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    coreGlowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.35, { duration: 850, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: corePulse.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: coreGlowOpacity.value,
  }));

  const orbitRadius = size * 0.62;
  const coreSize = size * 0.34;

  return (
    <View style={[styles.container, style]}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        {ORBIT_DOTS.map((dot, i) => (
          <OrbitDot
            key={dot.colorKey}
            index={i}
            total={ORBIT_DOTS.length}
            angle={angle}
            radius={orbitRadius}
            color={colors.emotions[dot.colorKey].primary}
            emoji={dot.emoji}
          />
        ))}

        <Animated.View
          pointerEvents="none"
          style={[
            styles.coreGlow,
            { width: coreSize * 2, height: coreSize * 2, borderRadius: coreSize },
            glowStyle,
          ]}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: coreSize }}
          />
        </Animated.View>

        <Animated.View style={[{ width: coreSize, height: coreSize, borderRadius: coreSize / 2 }, coreStyle]}>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: coreSize / 2 }}
          />
        </Animated.View>
      </View>

      {message && (
        <Typography variant="bodySmall" color={colors.textSecondary} style={styles.message}>
          {message}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  orbitDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreGlow: {
    position: 'absolute',
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
});
