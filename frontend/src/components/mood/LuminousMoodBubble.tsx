import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';

export interface LuminousMoodBubbleProps {
  id?: string;
  emotion: string;
  intensity: number; // 1 to 10
  authorName?: string;
  isAnonymous?: boolean;
  size?: 'sm' | 'md' | 'lg';
  isFloating?: boolean;
  showHalo?: boolean;
  showAuthor?: boolean;
  onPress?: () => void;
}

export const LuminousMoodBubble: React.FC<LuminousMoodBubbleProps> = ({
  emotion,
  intensity = 7,
  authorName,
  isAnonymous = false,
  size = 'md',
  isFloating = true,
  showHalo = true,
  showAuthor = true,
  onPress,
}) => {
  const { colors, isDark } = useTheme();
  const config = theme.getEmotionConfig(emotion);

  // Reanimated shared values
  const floatY = useSharedValue(0);
  const breathScale1 = useSharedValue(1);
  const breathOpacity1 = useSharedValue(0.4);
  const breathScale2 = useSharedValue(1);
  const breathOpacity2 = useSharedValue(0.25);
  const pressScale = useSharedValue(1);

  // Size configurations
  const sizeMap = {
    sm: { core: 38, iconSize: 18, fontSize: 'caption' as const, authorMax: 8 },
    md: { core: 54, iconSize: 26, fontSize: 'bodySmall' as const, authorMax: 12 },
    lg: { core: 72, iconSize: 34, fontSize: 'body' as const, authorMax: 16 },
  };

  const currentSize = sizeMap[size];

  // Normalized intensity multiplier (0.6 - 1.4)
  const intensityFactor = Math.max(0.6, Math.min(1.4, intensity / 7));

  useEffect(() => {
    if (isFloating) {
      // Gentle levitation float
      floatY.value = withRepeat(
        withSequence(
          withTiming(-6, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    }

    if (showHalo) {
      // Primary breathing corona
      breathScale1.value = withRepeat(
        withSequence(
          withTiming(1.35 * intensityFactor, {
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      breathOpacity1.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.15, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );

      // Secondary out-of-phase harmonic halo
      breathScale2.value = withRepeat(
        withSequence(
          withTiming(1.6 * intensityFactor, {
            duration: 2900,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, { duration: 2900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );

      breathOpacity2.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 2900, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.05, { duration: 2900, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }
  }, [isFloating, showHalo, intensityFactor]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { scale: pressScale.value },
    ],
  }));

  const animatedHalo1Style = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale1.value }],
    opacity: breathOpacity1.value,
  }));

  const animatedHalo2Style = useAnimatedStyle(() => ({
    transform: [{ scale: breathScale2.value }],
    opacity: breathOpacity2.value,
  }));

  const handlePressIn = () => {
    pressScale.value = withSpring(0.92, theme.springs.bouncy);
    theme.haptics.medium();
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 10, stiffness: 180 });
  };

  const displayName = isAnonymous
    ? 'Ghost Echo'
    : authorName || 'Seeker';

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.touchableArea}
      >
        {/* Outer Harmonic Glow Corona (Halo 2) */}
        {showHalo && (
          <Animated.View
            style={[
              styles.haloRing,
              {
                width: currentSize.core * 2.1,
                height: currentSize.core * 2.1,
                borderRadius: (currentSize.core * 2.1) / 2,
                backgroundColor: config.glow,
              },
              animatedHalo2Style,
            ]}
          />
        )}

        {/* Inner Responsive Corona (Halo 1) */}
        {showHalo && (
          <Animated.View
            style={[
              styles.haloRing,
              {
                width: currentSize.core * 1.6,
                height: currentSize.core * 1.6,
                borderRadius: (currentSize.core * 1.6) / 2,
                backgroundColor: config.primary,
              },
              animatedHalo1Style,
            ]}
          />
        )}

        {/* Luminous Core Orb */}
        <View
          style={[
            styles.coreOrb,
            {
              width: currentSize.core,
              height: currentSize.core,
              borderRadius: currentSize.core / 2,
              backgroundColor: isAnonymous ? '#252830' : config.primary,
              borderColor: isAnonymous ? '#C084FC' : '#FFFFFF',
              shadowColor: config.primary,
              shadowOpacity: 0.75,
              shadowRadius: 14 * intensityFactor,
            },
          ]}
        >
          {/* Glass Highlight Reflection */}
          <View style={styles.glassShine} />

          {/* Emotion Emoji Glyph */}
          <Text style={{ fontSize: currentSize.iconSize }}>
            {isAnonymous ? '👻' : config.emoji}
          </Text>

          {/* Intensity Mini-Pill Badge */}
          {size !== 'sm' && (
            <View
              style={[
                styles.intensityBadge,
                { backgroundColor: 'rgba(28, 30, 36, 0.9)' },
              ]}
            >
              <Typography
                variant="caption"
                weight="bold"
                color="#FFFFFF"
                style={styles.intensityText}
              >
                {intensity}
              </Typography>
            </View>
          )}
        </View>

        {/* Author Starlight Caption Label */}
        {showAuthor && (
          <View
            style={[
              styles.authorBadge,
              isDark
                ? { backgroundColor: 'rgba(28, 30, 36, 0.94)', borderColor: 'rgba(255, 255, 255, 0.16)' }
                : { backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: colors.glass.border },
            ]}
          >
            <View
              style={[
                styles.miniDot,
                { backgroundColor: isAnonymous ? '#C084FC' : config.primary },
              ]}
            />
            <Typography
              variant="caption"
              weight="semibold"
              color={colors.textPrimary}
              numberOfLines={1}
              style={styles.authorText}
            >
              {displayName}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  touchableArea: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  haloRing: {
    position: 'absolute',
    alignSelf: 'center',
  },
  coreOrb: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  glassShine: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: '40%',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    transform: [{ rotate: '-15deg' }],
  },
  intensityBadge: {
    position: 'absolute',
    bottom: -2,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  intensityText: {
    fontSize: 9,
    lineHeight: 11,
  },
  authorBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    ...theme.shadows.card,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  authorText: {
    fontSize: 11,
    maxWidth: 90,
  },
});
