import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TouchableOpacityProps,
} from 'react-native';
import { theme } from '@/theme';

export type CardVariant = 'elevated' | 'flat' | 'outlined' | 'glass';

export interface CardProps extends TouchableOpacityProps {
  variant?: CardVariant;
  emotion?: string; // Optional emotion theme highlighting
  padding?: keyof typeof theme.spacing;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  emotion,
  padding = 'lg',
  onPress,
  style,
  children,
  ...rest
}) => {
  const emotionConfig = emotion ? theme.getEmotionConfig(emotion) : null;

  const getCardStyle = (): ViewStyle => {
    let base: ViewStyle = {
      borderRadius: theme.radius.lg,
      padding: theme.spacing[padding],
    };

    switch (variant) {
      case 'flat':
        base.backgroundColor = theme.colors.surface;
        break;
      case 'outlined':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = theme.colors.border;
        break;
      case 'glass':
        base.backgroundColor = theme.colors.surfaceGlass;
        base.borderWidth = 1;
        base.borderColor = theme.colors.border;
        break;
      case 'elevated':
      default:
        base.backgroundColor = theme.colors.surfaceElevated;
        base.borderWidth = 1;
        base.borderColor = theme.colors.border;
        Object.assign(base, theme.shadows.card);
        break;
    }

    // Emotion glow accent
    if (emotionConfig) {
      base.borderColor = emotionConfig.border;
      base.backgroundColor = emotionConfig.background;
    }

    return base;
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[getCardStyle(), style]}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[getCardStyle(), style]}>{children}</View>;
};
