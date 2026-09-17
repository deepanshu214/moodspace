import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';

export type IconButtonVariant = 'default' | 'filled' | 'outlined' | 'ghost' | 'glass';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  badgeCount?: number;
  showBadgeDot?: boolean;
  backgroundColor?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  size = 'md',
  variant = 'default',
  badgeCount,
  showBadgeDot,
  backgroundColor,
  disabled,
  style,
  ...rest
}) => {
  const { colors } = useTheme();
  const getDimensions = (): { width: number; height: number; radius: number } => {
    switch (size) {
      case 'sm':
        return { width: 34, height: 34, radius: theme.radius.sm };
      case 'lg':
        return { width: 54, height: 54, radius: theme.radius.lg };
      case 'md':
      default:
        return { width: 44, height: 44, radius: theme.radius.md };
    }
  };

  const { width, height, radius: borderRadius } = getDimensions();

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      width,
      height,
      borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
    };

    if (backgroundColor) {
      base.backgroundColor = backgroundColor;
      return base;
    }

    switch (variant) {
      case 'filled':
        base.backgroundColor = colors.surfaceElevated;
        break;
      case 'outlined':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'glass':
        base.backgroundColor = colors.glass.surface;
        base.borderWidth = 1;
        base.borderColor = colors.glass.border;
        break;
      case 'default':
      default:
        base.backgroundColor = colors.surface;
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
    }

    if (disabled) {
      base.opacity = 0.4;
    }

    return base;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      style={[getContainerStyle(), style]}
      {...rest}
    >
      {icon}

      {showBadgeDot && !badgeCount && (
        <View style={styles.badgeDot} />
      )}

      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badgeNumberContainer}>
          <Typography variant="caption" weight="bold" color="#FFFFFF" style={styles.badgeText}>
            {badgeCount > 99 ? '99+' : badgeCount}
          </Typography>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
  },
  badgeNumberContainer: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
