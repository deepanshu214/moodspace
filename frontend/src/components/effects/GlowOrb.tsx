import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';

export interface GlowOrbProps {
  color?: string;
  size?: number;
  duration?: number;
  scaleRange?: [number, number];
  opacityRange?: [number, number];
  style?: StyleProp<ViewStyle>;
  wandering?: boolean;
}

export const GlowOrb: React.FC<GlowOrbProps> = ({
  color = theme.colors.primary,
  size = 200,
  duration = 3200,
  scaleRange = [0.9, 1.15],
  opacityRange = [0.35, 0.65],
  wandering = false,
  style,
}) => {
  const scale = useSharedValue(scaleRange[0]);
  const opacity = useSharedValue(opacityRange[0]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(scaleRange[1], {
          duration,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        }),
        withTiming(scaleRange[0], {
          duration,
          easing: Easing.bezier(0.4, 0, 0.6, 1),
        })
      ),
      -1,
      true
    );

    opacity.value = withRepeat(
      withSequence(
        withTiming(opacityRange[1], {
          duration: duration * 1.1,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(opacityRange[0], {
          duration: duration * 1.1,
          easing: Easing.inOut(Easing.ease),
        })
      ),
      -1,
      true
    );

    if (wandering) {
      translateX.value = withRepeat(
        withSequence(
          withTiming(20, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
          withTiming(-20, { duration: 4000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      translateY.value = withRepeat(
        withSequence(
          withTiming(-20, { duration: 4200, easing: Easing.inOut(Easing.ease) }),
          withTiming(20, { duration: 4200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      translateX.value = withTiming(0);
      translateY.value = withTiming(0);
    }
  }, [duration, scaleRange, opacityRange, wandering]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value }
    ],
    opacity: opacity.value,
  }));

  const half = size / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.container,
        { width: size, height: size, borderRadius: half },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.glowOuter,
          {
            width: size,
            height: size,
            borderRadius: half,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
      <View
        style={[
          styles.glowInner,
          {
            width: size * 0.55,
            height: size * 0.55,
            borderRadius: (size * 0.55) / 2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  glowOuter: {
    position: 'absolute',
    opacity: 0.25,
    filter: 'blur(35px)',
  } as any,
  glowInner: {
    position: 'absolute',
    opacity: 0.45,
    filter: 'blur(18px)',
  } as any,
});
