import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Dimensions, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { getAuroraBlobColors, getEmotionGradient } from '@/theme/gradients';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface AuroraBackgroundProps {
  emotion?: string;
  style?: StyleProp<ViewStyle>;
  reducedMotion?: boolean;
}

const AuroraBackgroundComponent: React.FC<AuroraBackgroundProps> = ({ 
  emotion, 
  style, 
  reducedMotion = false 
}) => {
  const [colors, setColors] = useState(() => getAuroraBlobColors(emotion));
  const containerOpacity = useSharedValue(1);

  // Drift values
  const b1x = useSharedValue(0);
  const b1y = useSharedValue(0);
  const b2x = useSharedValue(0);
  const b2y = useSharedValue(0);
  const b3x = useSharedValue(0);
  const b3y = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }
    // Blob 1: Slow lazy drift (12000ms cycle)
    b1x.value = withRepeat(
      withSequence(
        withTiming(60, { duration: 6000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-60, { duration: 6000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    b1y.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 7000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-40, { duration: 7000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Blob 2: Medium drift (8000ms cycle)
    b2x.value = withRepeat(
      withSequence(
        withTiming(-70, { duration: 4000, easing: Easing.inOut(Easing.quad) }),
        withTiming(50, { duration: 4000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    b2y.value = withRepeat(
      withSequence(
        withTiming(-60, { duration: 4500, easing: Easing.inOut(Easing.quad) }),
        withTiming(80, { duration: 4500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Blob 3: Quick accent (4000ms cycle)
    b3x.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(-40, { duration: 2000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    b3y.value = withRepeat(
      withSequence(
        withTiming(-30, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(30, { duration: 2200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
  }, [reducedMotion]);

  useEffect(() => {
    const newColors = getAuroraBlobColors(emotion);
    if (newColors.join(',') !== colors.join(',')) {
      if (reducedMotion) {
        setColors(newColors);
      } else {
        containerOpacity.value = withSequence(
          withTiming(0, { duration: 200 }, () => {
            runOnJS(setColors)(newColors);
          }),
          withTiming(1, { duration: 600 })
        );
      }
    }
  }, [emotion, reducedMotion]);

  const b1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b1x.value }, { translateY: b1y.value }],
  }));
  const b2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b2x.value }, { translateY: b2y.value }],
  }));
  const b3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: b3x.value }, { translateY: b3y.value }],
  }));

  const containerAnimStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  const baseOpacity = Platform.OS === 'android' ? 0.3 : 0.35;

  if (reducedMotion) {
    const gradient = getEmotionGradient(emotion);
    return (
      <View pointerEvents="none" style={[styles.container, style]}>
        <LinearGradient
          colors={gradient.colors}
          locations={gradient.locations}
          start={gradient.start}
          end={gradient.end}
          style={StyleSheet.absoluteFill}
        />
      </View>
    );
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.container, containerAnimStyle, style]}>
      {/* Blob 1 */}
      <Animated.View style={[styles.blob, styles.blob1, b1Style, { opacity: baseOpacity }]}>
        <LinearGradient
          colors={[colors[0], 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.2, y: 0.2 }}
          end={{ x: 0.8, y: 0.8 }}
        />
      </Animated.View>

      {/* Blob 2 */}
      <Animated.View style={[styles.blob, styles.blob2, b2Style, { opacity: baseOpacity }]}>
        <LinearGradient
          colors={[colors[1], 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.8, y: 0.2 }}
          end={{ x: 0.2, y: 0.8 }}
        />
      </Animated.View>

      {/* Blob 3 */}
      <Animated.View style={[styles.blob, styles.blob3, b3Style, { opacity: baseOpacity + 0.1 }]}>
        <LinearGradient
          colors={[colors[2], 'transparent']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    width: '100%',
    height: '100%',
  },
  blob: {
    position: 'absolute',
    borderRadius: 150,
  },
  blob1: {
    width: 320,
    height: 320,
    top: -50,
    left: -50,
  },
  blob2: {
    width: 340,
    height: 340,
    bottom: -80,
    right: -60,
  },
  blob3: {
    width: 220,
    height: 220,
    top: '35%',
    left: '25%',
    borderRadius: 110,
  },
});

export const AuroraBackground = React.memo(AuroraBackgroundComponent);
