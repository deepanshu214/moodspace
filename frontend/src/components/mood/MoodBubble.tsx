import React, { useEffect } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { emotionInk } from '@/theme/colors';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';

export interface MoodBubbleProps {
  emotion: string;
  intensity?: number; // 1 to 10
  authorName?: string;
  authorAvatar?: string | null;
  size?: 'sm' | 'md' | 'lg';
  isFloating?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MoodBubble: React.FC<MoodBubbleProps> = ({
  emotion,
  intensity = 5,
  authorName,
  authorAvatar,
  size = 'md',
  isFloating = true,
  onPress,
  style,
}) => {
  const { isDark } = useTheme();
  const emotionConfig = theme.getEmotionConfig(emotion);
  const pulseScale = useSharedValue(1);
  const pulseGlow = useSharedValue(0.3);

  const getBaseDimension = (): number => {
    switch (size) {
      case 'sm':
        return 48;
      case 'lg':
        return 88;
      case 'md':
      default:
        return 64;
    }
  };

  const baseDim = getBaseDimension();
  // Intensity adds subtle scaling
  const dimension = baseDim + (intensity / 10) * 12;

  useEffect(() => {
    if (isFloating) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 1600 + intensity * 60, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1600 + intensity * 60, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
      pulseGlow.value = withRepeat(
        withSequence(
          withTiming(0.65, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );
    }
  }, [isFloating, intensity]);

  const animatedBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: pulseGlow.value,
    transform: [{ scale: pulseScale.value * 1.25 }],
  }));

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.container, { width: dimension * 1.3, height: dimension * 1.3 }, style]}
    >
      {/* Ambient Pulsing Glow Ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: emotionConfig.glow,
          },
          animatedGlowStyle,
        ]}
      />

      {/* Main Emotion Bubble */}
      <Animated.View
        style={[
          styles.bubble,
          {
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
            backgroundColor: emotionConfig.background,
            borderColor: emotionConfig.primary,
          },
          animatedBubbleStyle,
        ]}
      >
        {authorAvatar ? (
          <Avatar source={authorAvatar} size={size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          <Typography variant={size === 'lg' ? 'h2' : size === 'sm' ? 'body' : 'h3'}>
            {emotionConfig.emoji}
          </Typography>
        )}

        {size !== 'sm' && (
          <Typography
            variant="caption"
            weight="bold"
            color={emotionInk(emotionConfig, isDark)}
            style={styles.label}
            numberOfLines={1}
          >
            {authorName || emotionConfig.label}
          </Typography>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  bubble: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
