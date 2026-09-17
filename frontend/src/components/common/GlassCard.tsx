import React, { useMemo } from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp, GestureResponderEvent, Platform, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { haptics } from '@/theme/haptics';
import { useTheme } from '@/context';
import { useTilt3D } from '@/hooks/useTilt3D';

export type GlassCardVariant = 'default' | 'hero' | 'compact' | 'stat';

export interface GlassCardProps {
  variant?: GlassCardVariant;
  glowColor?: string;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

const parseColorToRgba = (color: string, alpha: number): string => {
  if (!color) return `rgba(255, 255, 255, ${alpha})`;
  const trimmed = color.trim();
  if (trimmed.startsWith('rgba(')) {
    return trimmed.replace(/,\s*[\d.]+\)$/, `, ${alpha})`);
  }
  if (trimmed.startsWith('rgb(')) {
    return trimmed.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  }
  if (trimmed.startsWith('#')) {
    const hex = trimmed.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) || 0;
    const g = parseInt(hex.substring(2, 4), 16) || 0;
    const b = parseInt(hex.substring(4, 6), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return trimmed;
};

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glowColor,
  children,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const isPressed = useSharedValue(0);
  // 3D "physical card" tilt toward the exact point pressed — pure
  // onPressIn/onPressOut math, so it never competes with onPress.
  const { tiltStyle, onLayout, onPressIn: tiltPressIn, onPressOut: tiltPressOut } = useTilt3D(6, 1);

  const startBorder = useMemo(
    () => (glowColor ? parseColorToRgba(glowColor, 0.22) : colors.glass.border),
    [glowColor, colors]
  );
  const endBorder = useMemo(
    () => (glowColor ? parseColorToRgba(glowColor, 0.50) : colors.glass.borderGlow),
    [glowColor, colors]
  );

  const handlePressIn = (e: GestureResponderEvent) => {
    isPressed.value = withSpring(1, theme.springs.stiff);
    if (onPress) tiltPressIn(e);
    haptics.light();
  };

  const handlePressOut = () => {
    isPressed.value = withSpring(0, theme.springs.stiff);
    if (onPress) tiltPressOut();
  };

  const glowStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(isPressed.value, [0, 1], [startBorder, endBorder]),
  }));

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'hero':
        return { padding: theme.spacing.xl * 2, minHeight: 200 };
      case 'compact':
        return { padding: 10 };
      case 'stat':
        return { padding: theme.spacing.md, alignItems: 'center', justifyContent: 'center', minHeight: 120 };
      default:
        return { padding: theme.spacing.lg };
    }
  };

  // Light mode: pure white cards with warm shadow — always visible on cream bg
  // Dark mode: translucent indigo cards
  const cardBg = isDark ? colors.glass.surface : colors.surface;
  const shadowStyle: ViewStyle = isDark ? {} : {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  };

  return (
    <Animated.View
      onLayout={onPress ? onLayout : undefined}
      style={[
        styles.container,
        onPress ? tiltStyle : undefined,
        glowStyle,
        style,
        { borderColor: startBorder },
        shadowStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={styles.pressable}
      >
        <View style={[styles.inner, { backgroundColor: cardBg }]}>
          {variant === 'hero' && (
            <LinearGradient
              colors={['rgba(255,107,53,0.06)', 'rgba(255,159,28,0.03)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <View style={getVariantStyles()}>
            {children}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  pressable: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
