import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  visible: boolean;
  type?: ToastType;
  message: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export const Toast: React.FC<ToastProps> = ({
  visible,
  type = 'info',
  message,
  autoDismissMs = 3500,
  onDismiss,
  style,
}) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, theme.springs.bouncy);
      opacity.value = withTiming(1, { duration: 250 });

      if (type === 'success') haptics.success();
      else if (type === 'error') haptics.error();
      else if (type === 'warning') haptics.warning();
      else haptics.light();

      if (autoDismissMs > 0 && onDismiss) {
        const timer = setTimeout(() => {
          onDismiss();
        }, autoDismissMs);
        return () => clearTimeout(timer);
      }
    } else {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible, type, autoDismissMs, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: theme.colors.success,
          bg: theme.colors.surfaceElevated,
          border: 'rgba(0, 184, 148, 0.4)',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: theme.colors.error,
          bg: theme.colors.surfaceElevated,
          border: 'rgba(255, 118, 117, 0.4)',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: theme.colors.warning,
          bg: theme.colors.surfaceElevated,
          border: 'rgba(253, 203, 110, 0.4)',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: theme.colors.info,
          bg: theme.colors.surfaceElevated,
          border: 'rgba(9, 132, 227, 0.4)',
        };
    }
  };

  const config = getConfig();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
        },
        animatedStyle,
        style,
      ]}
    >
      <View style={[styles.accentStrip, { backgroundColor: config.color }]} />
      <Ionicons name={config.icon} size={20} color={config.color} style={styles.icon} />
      <Typography variant="bodySmall" color={theme.colors.textPrimary} style={styles.message}>
        {message}
      </Typography>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="close" size={16} color={theme.colors.textMuted} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    zIndex: 9999,
    overflow: 'hidden',
    ...theme.shadows.elevated,
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  icon: {
    marginRight: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  message: {
    flex: 1,
  },
});
