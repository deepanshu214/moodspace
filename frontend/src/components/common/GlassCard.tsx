import React from 'react';
import { StyleSheet, Pressable, ViewStyle, StyleProp, GestureResponderEvent, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { haptics } from '@/theme/haptics';

export type GlassCardVariant = 'default' | 'hero' | 'compact' | 'stat';

export interface GlassCardProps {
  variant?: GlassCardVariant;
  glowColor?: string;
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  variant = 'default',
  glowColor,
  children,
  onPress,
  style,
}) => {
  const isPressed = useSharedValue(0);

  const handlePressIn = (e: GestureResponderEvent) => {
    isPressed.value = withSpring(1, theme.springs.stiff);
    haptics.light();
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    isPressed.value = withSpring(0, theme.springs.stiff);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(1 - 0.03 * isPressed.value, theme.springs.stiff) }
      ],
      borderColor: glowColor 
        ? interpolateColor(
            isPressed.value,
            [0, 1],
            [
              glowColor.replace('rgb', 'rgba').replace(')', ', 0.08)'), 
              glowColor.replace('rgb', 'rgba').replace(')', ', 0.25)')
            ]
          )
        : theme.colors.glass.border,
    };
  });

  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'hero':
        return {
          padding: theme.spacing.xl * 2,
          minHeight: 200,
        };
      case 'compact':
        return {
          padding: 12,
        };
      case 'stat':
        return {
          aspectRatio: 1,
          padding: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        };
      case 'default':
      default:
        return {
          padding: theme.spacing.lg,
        };
    }
  };

  const Container = Platform.OS === 'android' ? View : BlurView;
  const containerProps = Platform.OS === 'android' 
    ? { style: [styles.blurContainer, { backgroundColor: theme.colors.glass.surface }] }
    : { intensity: 25, tint: 'dark' as const, style: styles.blurContainer };

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        style={styles.pressable}
      >
        <Container {...containerProps}>
          {Platform.OS === 'android' ? null : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.glass.surface }]} />
          )}
          
          {variant === 'hero' && (
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          )}
          <View style={getVariantStyles()}>
            {children}
          </View>
        </Container>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
  },
  pressable: {
    flex: 1,
  },
  blurContainer: {
    flex: 1,
  },
});
