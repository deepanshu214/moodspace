import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View, Dimensions, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
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
  isStar?: boolean;
}

interface SingleParticleProps {
  particle: Particle;
}

const SingleParticle: React.FC<SingleParticleProps> = ({ particle }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    if (particle.isStar) {
      // Shooting star behavior
      setTimeout(() => {
        translateX.value = withRepeat(
          withTiming(SCREEN_WIDTH * 1.5, {
            duration: 1500,
            easing: Easing.linear,
          }),
          -1,
          false
        );
        translateY.value = withRepeat(
          withTiming(SCREEN_HEIGHT * 1.5, {
            duration: 1500,
            easing: Easing.linear,
          }),
          -1,
          false
        );
        opacity.value = withRepeat(
          withSequence(
            withTiming(0, { duration: 0 }),
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 200 }),
            withTiming(0, { duration: 6000 + Math.random() * 5000 })
          ),
          -1,
          false
        );
      }, particle.delay);
    } else {
      // Normal particle behavior
      translateY.value = withRepeat(
        withTiming(-SCREEN_HEIGHT * 0.4, {
          duration: particle.duration,
          easing: Easing.linear,
        }),
        -1,
        false
      );

      translateX.value = withRepeat(
        withTiming(particle.driftX, {
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
    }
  }, [particle]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
    opacity: opacity.value,
  }));

  if (particle.isStar) {
    return (
      <Animated.View
        style={[
          styles.star,
          {
            left: particle.x,
            top: particle.y,
            backgroundColor: '#FFFFFF',
          },
          animatedStyle,
        ]}
      />
    );
  }

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
  reducedMotion?: boolean;
}

export const ParticleCanvas: React.FC<ParticleCanvasProps> = ({
  count = 20,
  style,
  reducedMotion = false,
}) => {
  const palette = [
    theme.colors.primaryLight,
    theme.colors.secondaryLight,
    theme.colors.accent,
    '#FFFFFF',
    theme.colors.emotions.joy.primary,
  ];

  const particles = useMemo<Particle[]>(() => {
    const normalCount = count;
    const starCount = 2; // Add a couple of shooting stars
    
    const normalParticles = Array.from({ length: normalCount }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      y: Math.random() * SCREEN_HEIGHT,
      size: Math.random() * 3 + 1.5,
      color: palette[Math.floor(Math.random() * palette.length)],
      duration: Math.random() * 8000 + 7000,
      delay: Math.random() * 2000,
      driftX: (Math.random() - 0.5) * 150,
      isStar: false,
    }));

    const starParticles = Array.from({ length: starCount }, (_, i) => ({
      id: normalCount + i,
      x: -100 - Math.random() * 200,
      y: -100 - Math.random() * 200,
      size: 2,
      color: '#FFFFFF',
      duration: 1500,
      delay: Math.random() * 10000,
      driftX: 0,
      isStar: true,
    }));

    return [...normalParticles, ...starParticles];
  }, [count]);

  if (reducedMotion) return null;

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
  star: {
    position: 'absolute',
    width: 60,
    height: 1,
    transform: [{ rotate: '45deg' }],
  },
});
