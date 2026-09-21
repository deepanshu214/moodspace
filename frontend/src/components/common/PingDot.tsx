import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/context';

export interface PingDotProps {
  size?: number;
  /** Defaults to the live-mint accent. */
  color?: string;
}

/** A small live indicator: a solid dot under an expanding halo. */
export const PingDot: React.FC<PingDotProps> = ({ size = 8, color }) => {
  const { colors } = useTheme();
  const tint = color ?? colors.accent;
  const p = useSharedValue(0);

  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }), -1, false);
  }, []);

  const halo = useAnimatedStyle(() => ({
    opacity: 0.75 * (1 - p.value),
    transform: [{ scale: 1 + 1.4 * p.value }],
  }));

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: size / 2, backgroundColor: tint },
          halo,
        ]}
      />
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: tint }} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
