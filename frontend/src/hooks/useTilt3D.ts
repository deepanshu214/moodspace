import { useRef } from 'react';
import { GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';

/**
 * useTilt3D — a lightweight, on-theme "3D press" interaction.
 *
 * On touch-down the surface tips toward the exact point pressed (perspective +
 * rotateX/rotateY), like a physical card being pressed at an angle, then
 * springs back flat on release. Pure Pressable onPressIn/onPressOut math —
 * no extra gesture recognizer, so it never competes with a Pressable's own
 * onPress for the touch responder.
 */
export const useTilt3D = (maxTiltDeg = 7, pressScale = 0.985) => {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const size = useRef({ width: 1, height: 1 });

  const onLayout = (e: LayoutChangeEvent) => {
    size.current = {
      width: e.nativeEvent.layout.width || 1,
      height: e.nativeEvent.layout.height || 1,
    };
  };

  const onPressIn = (e: GestureResponderEvent) => {
    const { width, height } = size.current;
    const px = (e.nativeEvent.locationX ?? width / 2) / width - 0.5;
    const py = (e.nativeEvent.locationY ?? height / 2) / height - 0.5;
    rotateY.value = withTiming(px * maxTiltDeg * 2, { duration: 140 });
    rotateX.value = withTiming(-py * maxTiltDeg * 2, { duration: 140 });
    scale.value = withSpring(pressScale, theme.springs.stiff);
  };

  const onPressOut = () => {
    rotateX.value = withSpring(0, theme.springs.gentle);
    rotateY.value = withSpring(0, theme.springs.gentle);
    scale.value = withSpring(1, theme.springs.bouncy);
  };

  const tiltStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 700 },
      { rotateX: `${rotateX.value}deg` },
      { rotateY: `${rotateY.value}deg` },
      { scale: scale.value },
    ],
  }));

  return { tiltStyle, onLayout, onPressIn, onPressOut };
};
