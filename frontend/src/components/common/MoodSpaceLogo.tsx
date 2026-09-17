import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Stop,
  Rect,
  Circle,
  Ellipse,
  Path,
  G,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export interface MoodSpaceLogoProps {
  size?: number;
  showBackground?: boolean;
  animated?: boolean;
}

/** Gradient ids must be unique per instance — several logos can share one document on web. */
let logoInstanceCounter = 0;

/**
 * MoodSpace — "Pastel Aura Heart-Beacon"
 * An organic smiling heart-bubble broadcasting soft aura rings, built from
 * buttercream / rose blush / mint pastel radial gradients.
 */
export const MoodSpaceLogo: React.FC<MoodSpaceLogoProps> = ({
  size = 80,
  showBackground = true,
  animated = false,
}) => {
  const uid = useMemo(() => `ms${++logoInstanceCounter}`, []);
  const breathe = useSharedValue(1);
  const beacon = useSharedValue(0.5);

  useEffect(() => {
    if (!animated) return;
    breathe.value = withRepeat(
      withSequence(
        withTiming(1.045, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
    beacon.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.45, { duration: 2600, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      true
    );
  }, [animated]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathe.value }],
  }));

  const beaconStyle = useAnimatedStyle(() => ({
    opacity: beacon.value * 0.7,
    transform: [{ scale: 0.92 + beacon.value * 0.14 }],
  }));

  // Organic, bubbly heart — visual centre sits at ~(50, 47)
  const HEART =
    'M50 81 C27 64 14 49 14 35 C14 23 23 14.5 33.5 14.5 ' +
    'C41 14.5 46.5 18.5 50 25 C53.5 18.5 59 14.5 66.5 14.5 ' +
    'C77 14.5 86 23 86 35 C86 49 73 64 50 81 Z';

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* ── Outward beacon pulse (behind everything) ── */}
      {animated && (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, beaconStyle]}>
          <Svg width={size} height={size} viewBox="0 0 100 100">
            <Defs>
              <RadialGradient id={`${uid}-beacon`} cx="50%" cy="50%" r="50%">
                <Stop offset="0.45" stopColor="#F8BBD0" stopOpacity="0" />
                <Stop offset="0.78" stopColor="#F8BBD0" stopOpacity="0.45" />
                <Stop offset="1" stopColor="#A7D7C5" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            <Circle cx="50" cy="50" r="49" fill={`url(#${uid}-beacon)`} />
          </Svg>
        </Animated.View>
      )}

      <Animated.View style={breatheStyle}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Defs>
            {/* Soft pastel backdrop: buttercream → rose blush → mint */}
            <SvgLinearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#FFF6DC" />
              <Stop offset="0.52" stopColor="#FDE7EF" />
              <Stop offset="1" stopColor="#E2F3EB" />
            </SvgLinearGradient>

            {/* Glass rim sheen across the top of the backdrop */}
            <RadialGradient id={`${uid}-rim`} cx="50%" cy="6%" r="78%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>

            {/* Heart body — buttercream core melting into rose blush */}
            <RadialGradient id={`${uid}-heart`} cx="38%" cy="26%" r="76%">
              <Stop offset="0" stopColor="#FFF8E1" />
              <Stop offset="0.42" stopColor="#FFE082" />
              <Stop offset="1" stopColor="#F8BBD0" />
            </RadialGradient>

            {/* Mint kiss on the lower-left lobe */}
            <RadialGradient id={`${uid}-mint`} cx="20%" cy="64%" r="52%">
              <Stop offset="0" stopColor="#A7D7C5" stopOpacity="0.92" />
              <Stop offset="1" stopColor="#A7D7C5" stopOpacity="0" />
            </RadialGradient>

            {/* Halo bloom hugging the heart */}
            <RadialGradient id={`${uid}-bloom`} cx="50%" cy="48%" r="50%">
              <Stop offset="0.5" stopColor="#F8BBD0" stopOpacity="0.30" />
              <Stop offset="1" stopColor="#F8BBD0" stopOpacity="0" />
            </RadialGradient>

            {/* Glossy top-left highlight */}
            <RadialGradient id={`${uid}-gloss`} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor="#FFFFFF" stopOpacity="0.9" />
              <Stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </RadialGradient>
          </Defs>

          {/* ── Pastel backdrop ── */}
          {showBackground && (
            <>
              <Rect x="0" y="0" width="100" height="100" rx="26" ry="26" fill={`url(#${uid}-bg)`} />
              <Rect x="0" y="0" width="100" height="56" rx="26" ry="26" fill={`url(#${uid}-rim)`} />
              <Rect
                x="1"
                y="1"
                width="98"
                height="98"
                rx="25.5"
                ry="25.5"
                fill="none"
                stroke="#FFFFFF"
                strokeOpacity="0.75"
                strokeWidth="1.4"
              />
            </>
          )}

          {/* ── Aura beacon rings ── */}
          <G opacity="0.55">
            <Circle cx="50" cy="47" r="45" fill="none" stroke="#A7D7C5" strokeOpacity="0.30" strokeWidth="1" />
            <Circle cx="50" cy="47" r="39" fill="none" stroke="#F8BBD0" strokeOpacity="0.38" strokeWidth="1.2" />
          </G>

          {/* ── Soft bloom behind the heart ── */}
          <Circle cx="50" cy="48" r="42" fill={`url(#${uid}-bloom)`} />

          {/* ── Heart body ── */}
          <Path d={HEART} fill={`url(#${uid}-heart)`} />
          <Path d={HEART} fill={`url(#${uid}-mint)`} />
          <Path
            d={HEART}
            fill="none"
            stroke="#FFFFFF"
            strokeOpacity="0.62"
            strokeWidth="2"
            strokeLinejoin="round"
          />

          {/* ── Glossy highlight on the upper-left lobe ── */}
          <Ellipse cx="34" cy="30" rx="11" ry="7.5" fill={`url(#${uid}-gloss)`} opacity="0.75" />

          {/* ── Friendly face ── */}
          <G fill="#7E5D52">
            <Ellipse cx="40" cy="38" rx="2.7" ry="3.3" />
            <Ellipse cx="60" cy="38" rx="2.7" ry="3.3" />
          </G>
          <Path
            d="M41 48.5 Q50 57.5 59 48.5"
            fill="none"
            stroke="#7E5D52"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Blush cheeks */}
          <Ellipse cx="32.5" cy="45" rx="4" ry="2.6" fill="#F8BBD0" opacity="0.75" />
          <Ellipse cx="67.5" cy="45" rx="4" ry="2.6" fill="#F8BBD0" opacity="0.75" />

          {/* ── Sparkles ── */}
          <Circle cx="17" cy="20" r="2.4" fill="#FFFFFF" opacity="0.9" />
          <Circle cx="85" cy="18" r="1.9" fill="#FFFFFF" opacity="0.8" />
          <Circle cx="88" cy="74" r="2.2" fill="#FFFFFF" opacity="0.72" />
          <Circle cx="13" cy="72" r="1.6" fill="#FFFFFF" opacity="0.65" />
        </Svg>
      </Animated.View>
    </View>
  );
};
