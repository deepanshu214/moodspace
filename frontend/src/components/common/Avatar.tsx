import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  emotion?: string; // Optional emotion aura ring
  showPresence?: boolean;
  isOnline?: boolean;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  emotion,
  showPresence = false,
  isOnline = false,
  style,
}) => {
  const getDimensions = (): number => {
    switch (size) {
      case 'xs':
        return 26;
      case 'sm':
        return 34;
      case 'lg':
        return 60;
      case 'xl':
        return 84;
      case 'md':
      default:
        return 44;
    }
  };

  const dimension = getDimensions();
  const radius = dimension / 2;
  const emotionConfig = emotion ? theme.getEmotionConfig(emotion) : null;

  const getInitials = (text?: string): string => {
    if (!text) return '';
    const parts = text.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatarWrapper,
          {
            width: dimension,
            height: dimension,
            borderRadius: radius,
            borderColor: emotionConfig ? emotionConfig.primary : theme.colors.border,
            borderWidth: emotionConfig ? 2 : 1,
          },
        ]}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={{ width: dimension, height: dimension, borderRadius: radius }}
            contentFit="cover"
            transition={200}
          />
        ) : name ? (
          <Typography
            variant={size === 'xs' || size === 'sm' ? 'caption' : size === 'xl' ? 'h2' : 'body'}
            weight="bold"
            color={emotionConfig ? emotionConfig.primary : theme.colors.primaryLight}
          >
            {getInitials(name)}
          </Typography>
        ) : (
          <Ionicons
            name="person"
            size={dimension * 0.5}
            color={theme.colors.textMuted}
          />
        )}
      </View>

      {showPresence && (
        <View
          style={[
            styles.presenceDot,
            {
              backgroundColor: isOnline ? theme.colors.success : theme.colors.textDisabled,
              width: Math.max(8, dimension * 0.22),
              height: Math.max(8, dimension * 0.22),
              borderRadius: dimension * 0.11,
            },
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
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  presenceDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});
