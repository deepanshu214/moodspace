import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { emotionInk } from '@/theme/colors';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  emotion?: string;
  showPresence?: boolean;
  isOnline?: boolean;
  isAnonymous?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  emotion,
  showPresence = false,
  isOnline = false,
  isAnonymous = false,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const pulseScale = useSharedValue(0.8);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (showPresence && isOnline) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.8, { duration: 1500, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [showPresence, isOnline]);

  useEffect(() => {
    if (emotion) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [emotion]);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const getDimensions = (): number => {
    switch (size) {
      case 'xs': return 26;
      case 'sm': return 34;
      case 'lg': return 60;
      case 'xl': return 84;
      case 'md':
      default: return 44;
    }
  };

  const dimension = getDimensions();
  const radius = dimension / 2;
  const emotionConfig = emotion ? theme.getEmotionConfig(emotion) : null;
  const gradientPair = emotionConfig?.gradientPair || [colors.border, colors.border];

  const getInitials = (text?: string): string => {
    if (!text) return '';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, { width: dimension + (emotionConfig ? 4 : 0), height: dimension + (emotionConfig ? 4 : 0) }, style]}>
      {emotionConfig && (
        <Animated.View style={[StyleSheet.absoluteFill, animatedRingStyle, { borderRadius: radius + 2, overflow: 'hidden' }]}>
          <LinearGradient
            colors={gradientPair}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      
      <View
        style={[
          styles.avatarWrapper,
          {
            width: dimension,
            height: dimension,
            borderRadius: radius,
            backgroundColor: isAnonymous ? '#252830' : colors.surfaceElevated,
            borderWidth: emotionConfig ? 2 : 1,
            borderColor: emotionConfig ? colors.background : colors.border,
          },
        ]}
      >
        {isAnonymous ? (
          <Ionicons
            name="planet-outline"
            size={dimension * 0.52}
            color={colors.accentInk}
          />
        ) : source ? (
          <Image
            source={{ uri: source }}
            style={{ width: dimension - 2, height: dimension - 2, borderRadius: radius - 1 }}
            contentFit="cover"
            transition={200}
          />
        ) : name ? (
          <Typography
            variant={size === 'xs' || size === 'sm' ? 'caption' : size === 'xl' ? 'h2' : 'body'}
            weight="bold"
            color={emotionConfig ? emotionInk(emotionConfig, isDark) : colors.accentInk}
          >
            {getInitials(name)}
          </Typography>
        ) : (
          <Ionicons
            name="person"
            size={dimension * 0.5}
            color={colors.textMuted}
          />
        )}
      </View>

      {showPresence && (
        <Animated.View
          style={[
            styles.presenceDot,
            {
              backgroundColor: isOnline ? colors.success : colors.textDisabled,
              width: Math.max(8, dimension * 0.22),
              height: Math.max(8, dimension * 0.22),
              borderRadius: dimension * 0.11,
              borderColor: colors.background,
              shadowColor: colors.success,
            },
            isOnline ? animatedDotStyle : null,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
});
