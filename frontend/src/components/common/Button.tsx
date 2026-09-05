import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  customColor?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  customColor,
  style,
  ...rest
}) => {
  const isDisabled = disabled || loading;

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

    // Size padding
    switch (size) {
      case 'sm':
        base.paddingVertical = theme.spacing.xs + 2;
        base.paddingHorizontal = theme.spacing.md;
        base.minHeight = 36;
        break;
      case 'lg':
        base.paddingVertical = theme.spacing.md;
        base.paddingHorizontal = theme.spacing.xxl;
        base.minHeight = 54;
        break;
      case 'md':
      default:
        base.paddingVertical = theme.spacing.sm + 2;
        base.paddingHorizontal = theme.spacing.lg;
        base.minHeight = 46;
        break;
    }

    // Variant colors
    if (customColor) {
      base.backgroundColor = variant === 'outline' ? 'transparent' : customColor;
      if (variant === 'outline') {
        base.borderWidth = 1.5;
        base.borderColor = customColor;
      }
      return base;
    }

    switch (variant) {
      case 'secondary':
        base.backgroundColor = theme.colors.surfaceElevated;
        base.borderWidth = 1;
        base.borderColor = theme.colors.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = theme.colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = theme.colors.error;
        break;
      case 'primary':
      default:
        base.backgroundColor = theme.colors.primary;
        break;
    }

    if (isDisabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (customColor && variant === 'outline') return customColor;
    if (customColor && variant !== 'outline') return theme.colors.textPrimary;

    switch (variant) {
      case 'secondary':
        return theme.colors.textPrimary;
      case 'outline':
        return theme.colors.primaryLight;
      case 'ghost':
        return theme.colors.primaryLight;
      case 'danger':
        return '#FFFFFF';
      case 'primary':
      default:
        return '#FFFFFF';
    }
  };

  const getTextVariant = () => {
    switch (size) {
      case 'sm':
        return 'bodySmall';
      case 'lg':
        return 'title';
      case 'md':
      default:
        return 'button';
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      style={[getContainerStyle(), style]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getTextColor()} />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Typography
            variant={getTextVariant()}
            weight="semibold"
            color={getTextColor()}
          >
            {title}
          </Typography>
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
});
