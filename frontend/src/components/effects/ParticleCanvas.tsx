import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  duration: number;
  delay: number;
  driftX: number;
}

interface SingleParticleProps {
  particle: Particle;
}

const SingleParticle: React.FC<SingleParticleProps> = ({ particle }) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    translateY.value = withRepeat(
      withTiming(-SCREEN_HEIGHT * 0.35, {
        duration: particle.duration,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    opacity.value = withRepeat(
      withTiming(0.7, {
        duration: particle.duration / 2,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, [particle.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: particle.x,
          top: particle.y,
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor: particle.color,
        },
        animatedStyle,
      ]}
    />
  );
};

export interface ParticleCanvasProps {
  count?: number;
  style?: StyleProp<ViewStyle>;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  count = 20,
  style,
}) => {
  const palette = [
    theme.colors.primaryLight,
    theme.colors.secondaryLight,
    theme.colors.accent,
    '#FFFFFF',
    theme.colors.emotions.joy.primary,
  ];

  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 3 + 1.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      duration: Math.random() * 8000 + 7000,
      delay: Math.random() * 2000,
      driftX: (Math.random() - 0.5) * 40,
    }));
  }, [count]);

  return (
    <View pointerEvents="none" style={[styles.container, style]}>
      {particles.map((p) => (
        <SingleParticle key={p.id} particle={p} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill as object,
    overflow: 'hidden',
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
  },
});
