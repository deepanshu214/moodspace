import React, { useEffect } from 'react';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Platform } from 'react-native';

export interface MoodSpaceLogoProps {
  size?: number;
  showBackground?: boolean;
  animated?: boolean;
}

export const MoodSpaceLogo: React.FC<MoodSpaceLogoProps> = ({
  size = 80,
  showBackground = true,
  animated = false,
}) => {
  const floatY = useSharedValue(0);

  useEffect(() => {
    if (!animated || Platform.OS === 'web') return;
    floatY.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 2400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animated]);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <Animated.View style={floatStyle}>
      <Svg width={size} height={size} viewBox="0 0 100 100">
        <Defs>
          {/* Rounded square background: coral → rose → violet */}
          <SvgLinearGradient id="msLogoBg" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF6B35" />
            <Stop offset="0.45" stopColor="#FF4D84" />
            <Stop offset="1" stopColor="#C471ED" />
          </SvgLinearGradient>

          {/* Joy bubble: golden sunlight */}
          <RadialGradient id="msJoy" cx="40%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#FFE566" stopOpacity="1" />
            <Stop offset="1" stopColor="#FF9F1C" stopOpacity="0.9" />
          </RadialGradient>

          {/* Calm bubble: ocean teal */}
          <RadialGradient id="msCalm" cx="40%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#7EFFD4" stopOpacity="1" />
            <Stop offset="1" stopColor="#00B4A6" stopOpacity="0.9" />
          </RadialGradient>

          {/* Love bubble: rose blush */}
          <RadialGradient id="msLove" cx="40%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#FFB3CA" stopOpacity="1" />
            <Stop offset="1" stopColor="#FF4D84" stopOpacity="0.9" />
          </RadialGradient>

          {/* Center glow — where all three meet */}
          <RadialGradient id="msGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity="0.55" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>

          {/* Outer ring shimmer */}
          <RadialGradient id="msRim" cx="50%" cy="10%" r="80%">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* ── Background rounded square ── */}
        {showBackground && (
          <>
            <Rect x="0" y="0" width="100" height="100" rx="24" ry="24" fill="url(#msLogoBg)" />
            {/* Glass rim shimmer at top */}
            <Rect x="6" y="6" width="88" height="44" rx="20" ry="20" fill="url(#msRim)" />
          </>
        )}

        {/* ── 3 overlapping mood bubbles in a triangle ── */}

        {/* Joy — top center */}
        <Circle cx="50" cy="39" r="23" fill="url(#msJoy)" opacity="0.90" />

        {/* Calm — bottom left */}
        <Circle cx="34" cy="65" r="23" fill="url(#msCalm)" opacity="0.90" />

        {/* Love — bottom right */}
        <Circle cx="66" cy="65" r="23" fill="url(#msLove)" opacity="0.90" />

        {/* ── Center glow at triple-overlap ── */}
        <Circle cx="50" cy="56" r="14" fill="url(#msGlow)" />

        {/* ── Sparkle accent dots ── */}
        <Circle cx="18" cy="19" r="2.8" fill="white" opacity="0.80" />
        <Circle cx="84" cy="16" r="2.2" fill="white" opacity="0.70" />
        <Circle cx="13" cy="80" r="1.9" fill="white" opacity="0.60" />
        <Circle cx="88" cy="82" r="2.4" fill="white" opacity="0.72" />
        <Circle cx="50" cy="9" r="1.6" fill="white" opacity="0.55" />
      </Svg>
    </Animated.View>
  );
};
