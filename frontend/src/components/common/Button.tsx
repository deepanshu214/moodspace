import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { haptics } from '@/theme/haptics';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  pill?: boolean;
  customColor?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
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
  pill = true,
  customColor,
  onPress,
  style,
}) => {
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, theme.springs.snappy);
      haptics.light();
    }
  };

  const handlePressOut = () => {
    if (!isDisabled) {
      scale.value = withSpring(1, theme.springs.bouncy);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: pill ? theme.radius.round : theme.radius.md,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
    };

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
      case 'ghost':
        return theme.colors.primaryLight;
      case 'danger':
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
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth]}>
      <Pressable
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[getContainerStyle(), style as any]}
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
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
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
