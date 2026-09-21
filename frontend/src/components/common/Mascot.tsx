import React, { useEffect, useMemo, useState } from 'react';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Path, Ellipse, Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

let mascotCounter = 0;

/** "Droplet" — the MoodSpace loading mascot from the Stitch loading screen. */
export const Mascot: React.FC<{ size?: number; animated?: boolean }> = ({ size = 112, animated = true }) => {
  const uid = useMemo(() => `mascot${++mascotCounter}`, []);
  const bounce = useSharedValue(0);
  const [blinking, setBlinking] = useState(false);

  // A blink every few seconds; SVG shapes swap rather than animate, which
  // behaves identically on iOS, Android and web.
  useEffect(() => {
    if (!animated) return;
    const timer = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 130);
    }, 4200);
    return () => clearInterval(timer);
  }, [animated]);

  useEffect(() => {
    if (!animated) return;
    bounce.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 520, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 520, easing: Easing.in(Easing.quad) })
      ),
      -1,
      false
    );
  }, [animated]);

  // Squash and stretch: rises tall, lands wide.
  const bounceStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: -14 * bounce.value },
      { scaleY: 1 + 0.06 * bounce.value },
      { scaleX: 1 - 0.04 * bounce.value },
    ],
  }));

  return (
    <Animated.View style={bounceStyle}>
      <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
        <Defs>
          <LinearGradient id={`${uid}-body`} x1="20" y1="15" x2="100" y2="105" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FF7352" />
            <Stop offset="0.65" stopColor="#FF5C38" />
            <Stop offset="1" stopColor="#E03E1A" />
          </LinearGradient>
          <RadialGradient id={`${uid}-sheen`} cx="42" cy="38" r="32" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.45" />
            <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Path
          d="M60 14 C60 14 26 50 26 74 C26 92.78 41.22 108 60 108 C78.78 108 94 92.78 94 74 C94 50 60 14 60 14 Z"
          fill={`url(#${uid}-body)`}
        />
        <Ellipse cx="44" cy="48" rx="14" ry="20" fill={`url(#${uid}-sheen)`} transform="rotate(-28 44 48)" />
        <Circle cx="76" cy="78" r="3" fill="#FFFFFF" fillOpacity={0.25} />
        <Ellipse cx="42" cy="74" rx="5" ry="3.2" fill="#FFB4A3" fillOpacity={0.75} />
        <Ellipse cx="78" cy="74" rx="5" ry="3.2" fill="#FFB4A3" fillOpacity={0.75} />
        <G>
          {blinking ? (
            <>
              <Path d="M44.8 65 C46.8 62.6 51.2 62.6 53.2 65" stroke="#3D0600" strokeWidth={2.4} strokeLinecap="round" fill="none" />
              <Path d="M66.8 65 C68.8 62.6 73.2 62.6 75.2 65" stroke="#3D0600" strokeWidth={2.4} strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <Circle cx="49" cy="65" r="4.2" fill="#3D0600" />
              <Circle cx="47.5" cy="63.5" r="1.5" fill="#FFFFFF" />
              <Circle cx="71" cy="65" r="4.2" fill="#3D0600" />
              <Circle cx="69.5" cy="63.5" r="1.5" fill="#FFFFFF" />
            </>
          )}
        </G>
        <Path d="M56 71.5 C58 74.5 62 74.5 64 71.5" stroke="#3D0600" strokeWidth={2.2} strokeLinecap="round" />
        <Path d="M60 14 C60 8 66 5 69 7 C67 11 63 12.5 60 14 Z" fill="#81FAB5" />
      </Svg>
    </Animated.View>
  );
};
