import React, { useEffect } from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
  GestureResponderEvent,
  Platform,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  interpolateColor,
  SharedValue,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';
import { haptics } from '@/theme/haptics';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'glass' | 'aurora';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const scale = useSharedValue(1);
  const shimmerTranslateX = useSharedValue(-SCREEN_WIDTH);
  const colorPhase = useSharedValue(0);

  useEffect(() => {
    if (loading) {
      shimmerTranslateX.value = withRepeat(
        withTiming(SCREEN_WIDTH, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      shimmerTranslateX.value = -SCREEN_WIDTH;
    }
  }, [loading]);

  useEffect(() => {
    if (variant === 'aurora') {
      colorPhase.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [variant]);

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!isDisabled) {
      scale.value = withSpring(0.96, theme.springs.stiff);
      haptics.light();
    }
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!isDisabled) {
      scale.value = withSpring(1, theme.springs.bouncy);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerTranslateX.value }],
  }));

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: pill ? theme.radius.round : theme.radius.md,
      alignSelf: fullWidth ? 'stretch' : 'flex-start',
      overflow: 'hidden',
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

    if (customColor && variant !== 'glass' && variant !== 'aurora') {
      base.backgroundColor = variant === 'outline' ? 'transparent' : customColor;
      if (variant === 'outline') {
        base.borderWidth = 1.5;
        base.borderColor = customColor;
      }
      if (isDisabled) base.opacity = 0.5;
      return base;
    }

    switch (variant) {
      case 'secondary':
        base.backgroundColor = colors.surfaceElevated;
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
      case 'outline':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1.5;
        base.borderColor = colors.primary;
        break;
      case 'ghost':
        base.backgroundColor = 'transparent';
        break;
      case 'danger':
        base.backgroundColor = colors.error;
        break;
      case 'glass':
        base.borderWidth = 1;
        base.borderColor = colors.glass.border;
        break;
      case 'aurora':
        // Gradient background handled by inner element
        break;
      case 'primary':
      default:
        base.backgroundColor = colors.primary;
        break;
    }

    if (isDisabled) {
      base.opacity = 0.5;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (customColor && variant === 'outline') return customColor;
    if (customColor && variant !== 'outline') return colors.textPrimary;

    switch (variant) {
      case 'secondary':
      case 'glass':
        return colors.textPrimary;
      case 'outline':
      case 'ghost':
        return colors.primaryLight;
      case 'danger':
      case 'aurora':
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

  const renderBackground = () => {
    if (variant === 'glass') {
      const Container = Platform.OS === 'android' ? View : BlurView;
      const containerProps = Platform.OS === 'android' 
        ? { style: [StyleSheet.absoluteFill, { backgroundColor: colors.glass.surface }] }
        : { intensity: 25, tint: 'dark' as const, style: StyleSheet.absoluteFill };
      
      return (
        <Container {...containerProps}>
          {Platform.OS !== 'android' && (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass.surface }]} />
          )}
        </Container>
      );
    }
    
    if (variant === 'aurora') {
      return (
        <AnimatedGradientView style={StyleSheet.absoluteFill} colorPhase={colorPhase} />
      );
    }
    
    return null;
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
        {renderBackground()}

        {loading && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <LinearGradient
                colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.4)', 'rgba(255,255,255,0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
            </Animated.View>
          </View>
        )}

        <View style={styles.contentRow} pointerEvents="none">
          {!loading && leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <Typography
            variant={getTextVariant()}
            weight="semibold"
            color={getTextColor()}
            style={loading ? styles.hiddenText : undefined}
          >
            {title}
          </Typography>
          {!loading && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const AnimatedGradientView = ({ style, colorPhase }: { style: any, colorPhase: SharedValue<number> }) => {
  const animatedProps = useAnimatedStyle(() => {
    return {
      opacity: 1,
    };
  });
  
  // Since LinearGradient doesn't support reanimated colors directly without createAnimatedComponent on a custom View
  // We'll use two overlapping gradients and fade between them
  const auroraColors1: readonly [string, string] = ['#4A00E0', '#8E2DE2']; // Example aurora pair 1
  const auroraColors2: readonly [string, string] = ['#00C9FF', '#92FE9D']; // Example aurora pair 2

  const style1 = useAnimatedStyle(() => ({
    opacity: 1 - colorPhase.value
  }));

  const style2 = useAnimatedStyle(() => ({
    opacity: colorPhase.value
  }));

  return (
    <View style={style}>
      <Animated.View style={[StyleSheet.absoluteFill, style1]}>
         <LinearGradient
            colors={auroraColors1}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
         />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, style2]}>
         <LinearGradient
            colors={auroraColors2}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
         />
      </Animated.View>
    </View>
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
    zIndex: 1,
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  shimmer: {
    width: '50%',
    height: '100%',
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  hiddenText: {
    opacity: 0,
  },
});
