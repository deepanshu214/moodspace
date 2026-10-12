import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { ReactionGlyph, ReactionKey } from './MoodGlyph';

export interface ReactionFloaterProps {
  reaction: ReactionKey;
  /** Tint for the drifting glyphs; defaults to the reaction pill's ink. */
  color?: string;
  triggerKey: number;
}

interface ParticleProps {
  reaction: ReactionKey;
  color?: string;
  index: number;
  triggerKey: number;
}

const Particle: React.FC<ParticleProps> = ({ reaction, color, index, triggerKey }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const angleOffset = (index - 1) * 22; // spread particles left, center, right
  const delayMs = index * 40;

  useEffect(() => {
    if (!triggerKey) return;

    // Reset values
    translateY.value = 0;
    translateX.value = 0;
    opacity.value = 0;
    scale.value = 0.5;

    // Start floating animation
    opacity.value = withDelay(
      delayMs,
      withSequence(
        withTiming(1, { duration: 150 }),
        withDelay(350, withTiming(0, { duration: 300, easing: Easing.out(Easing.quad) }))
      )
    );

    scale.value = withDelay(
      delayMs,
      withSequence(
        withSpring(1.2, { damping: 5, stiffness: 200 }),
        withTiming(0.8, { duration: 500 })
      )
    );

    translateY.value = withDelay(
      delayMs,
      withTiming(-70 - index * 15, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      })
    );

    translateX.value = withDelay(
      delayMs,
      withTiming(angleOffset, {
        duration: 800,
        easing: Easing.out(Easing.sin),
      })
    );
  }, [triggerKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.particle, animatedStyle]} pointerEvents="none">
      <ReactionGlyph reaction={reaction} size={20} color={color} />
    </Animated.View>
  );
};

export const ReactionFloater: React.FC<ReactionFloaterProps> = ({ reaction, color, triggerKey }) => {
  if (!triggerKey) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {[0, 1, 2].map((index) => (
        <Particle key={index} reaction={reaction} color={color} index={index} triggerKey={triggerKey} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -10,
    left: '50%',
    marginLeft: -12,
    zIndex: 999,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    pointerEvents: 'none',
  },
});
