import React, { useEffect } from 'react';
import { View } from 'react-native';
import Svg, { Rect, Path, Circle, Line, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/context';

export interface MoodSpaceLogoProps {
  size?: number;
  /** Draw the white app-icon tile (ink contour + hard offset shadow) behind the mark. */
  showBackground?: boolean;
  animated?: boolean;
}

const INK = '#1B1B1C';

/** The radar-bubble mark on a 100×100 grid (Stitch "Orb-01"). */
const RadarBubble: React.FC = () => (
  <G>
    <Path
      d="M50 12C31.2 12 16 26.5 16 44.5C16 54.3 20.8 62.9 28.5 68.6L24 84L39.8 76.5C43 77.2 46.4 77.6 50 77.6C68.8 77.6 84 63.1 84 44.5C84 26.5 68.8 12 50 12Z"
      fill="#FF5C38"
      stroke={INK}
      strokeWidth={4.5}
      strokeLinejoin="round"
    />
    <Circle cx={50} cy={44} r={18} fill="#FFD15C" stroke={INK} strokeWidth={4.5} />
    <Circle cx={50} cy={44} r={7} fill="#FCF9F8" stroke={INK} strokeWidth={3} />
    <Line x1={50} y1={26} x2={50} y2={33} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Line x1={50} y1={55} x2={50} y2={62} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Line x1={32} y1={44} x2={39} y2={44} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Line x1={61} y1={44} x2={68} y2={44} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <Circle cx={78} cy={18} r={7} fill="#63DD9A" stroke={INK} strokeWidth={4} />
  </G>
);

/**
 * MoodSpace radar-bubble logo: a speech bubble (a shared feeling) with a
 * locator target (a place on the living map). Reads from 28px to hero size.
 */
export const MoodSpaceLogo: React.FC<MoodSpaceLogoProps> = ({
  size = 80,
  showBackground = true,
  animated = false,
}) => {
  const { colors } = useTheme();
  const bob = useSharedValue(0);

  useEffect(() => {
    if (!animated) return;
    bob.value = withRepeat(
      withSequence(
        withTiming(-4, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [animated]);

  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View style={[{ width: size, height: size }, bobStyle]}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} viewBox="0 0 100 100">
          {showBackground ? (
            <>
              {/* Hard offset shadow, then the tile with its ink contour */}
              <Rect x={11} y={11} width={86} height={86} rx={22} fill={colors.hardShadow} />
              <Rect x={3} y={3} width={86} height={86} rx={22} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
              <G transform="translate(12 11) scale(0.68)">
                <RadarBubble />
              </G>
            </>
          ) : (
            <RadarBubble />
          )}
        </Svg>
      </View>
    </Animated.View>
  );
};
