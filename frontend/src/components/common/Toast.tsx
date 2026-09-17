import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle, View, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/theme';
import { useTheme } from '@/context';
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
  const { colors } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const rotate = useSharedValue('-2deg');

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, theme.springs.wobbly);
      opacity.value = withTiming(1, { duration: 250 });
      scale.value = withSpring(1, theme.springs.bouncy);
      rotate.value = withSpring('0deg', theme.springs.wobbly);

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
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [visible, type, autoDismissMs, onDismiss]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
      { rotate: rotate.value }
    ],
    opacity: opacity.value,
  }));

  if (!visible) return null;

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle' as const,
          color: colors.success,
          gradient: [colors.success, '#00b894'] as [string, string],
          border: 'rgba(0, 184, 148, 0.4)',
        };
      case 'error':
        return {
          icon: 'alert-circle' as const,
          color: colors.error,
          gradient: [colors.error, '#ff7675'] as [string, string],
          border: 'rgba(255, 118, 117, 0.4)',
        };
      case 'warning':
        return {
          icon: 'warning' as const,
          color: colors.warning,
          gradient: [colors.warning, '#fdcb6e'] as [string, string],
          border: 'rgba(253, 203, 110, 0.4)',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle' as const,
          color: colors.info,
          gradient: [colors.info, '#0984e3'] as [string, string],
          border: 'rgba(9, 132, 227, 0.4)',
        };
    }
  };

  const config = getConfig();

  const Container = Platform.OS === 'android' ? View : BlurView;
  const containerProps = Platform.OS === 'android'
    ? { style: [styles.glassContainer, { backgroundColor: colors.glass.surface, borderColor: colors.glass.border }] }
    : { intensity: 25, tint: 'dark' as const, style: [styles.glassContainer, { borderColor: colors.glass.border }] };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Container {...containerProps}>
        {Platform.OS !== 'android' && (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.glass.surface }]} />
        )}
        
        <View style={styles.accentStripWrapper}>
          <LinearGradient
            colors={config.gradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
        </View>

        <View style={styles.contentRow}>
          <Ionicons name={config.icon} size={20} color={config.color} style={styles.icon} />
          <Typography variant="bodySmall" color={colors.textPrimary} style={styles.message}>
            {message}
          </Typography>
          {onDismiss && (
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </Container>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 54,
    left: 20,
    right: 20,
    zIndex: 9999,
    ...theme.shadows.glassGlow,
  },
  glassContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
  },
  accentStripWrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 2,
  },
  icon: {
    marginRight: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  message: {
    flex: 1,
  },
});
