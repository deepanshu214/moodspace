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

  // Neo-Editorial: a card is an ink contour, and a mood tint only deepens it
  // on press rather than replacing the outline with a wash.
  const startBorder = useMemo(() => colors.ink, [colors]);
  const endBorder = useMemo(
    () => (glowColor ? parseColorToRgba(glowColor, 0.85) : colors.ink),
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
  const cardBg = colors.surface;
  // The hard offset block is drawn by <Tactile/> where it is wanted; cards that
  // still use GlassCard keep a flat contour so the two never fight each other.
  const shadowStyle: ViewStyle = {};

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
              colors={['rgba(255, 92, 56,0.07)', 'rgba(92, 214, 148,0.05)']}
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
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
  },
  pressable: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});
