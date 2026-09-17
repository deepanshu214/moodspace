import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';

export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

export interface BadgeProps {
  count?: number;
  maxCount?: number;
  variant?: BadgeVariant;
  dot?: boolean;
  color?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'secondary',
  dot = false,
  color,
  style,
}) => {
  const { colors } = useTheme();
  const getBackgroundColor = (): string => {
    if (color) return color;
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      case 'neutral':
        return colors.surfaceHighlight;
      case 'secondary':
      default:
        return colors.secondary;
    }
  };

  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          { backgroundColor: getBackgroundColor() },
          style,
        ]}
      />
    );
  }

  if (count === undefined || count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Typography variant="caption" weight="bold" color="#FFFFFF" style={styles.badgeText}>
        {displayCount}
      </Typography>
    </View>
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 11,
    lineHeight: 13,
  },
});
