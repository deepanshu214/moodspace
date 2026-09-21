import React from 'react';
import { View, Pressable, StyleSheet, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/context';
import { haptics } from '@/theme/haptics';

export interface TactileProps {
  children?: React.ReactNode;
  /** Hard shadow offset in px (Stitch elevation 1/2/3 = 2/4/6). 0 = flat. */
  offset?: 0 | 2 | 4 | 6;
  radius?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  /** Outer layout (margins, flex, width). */
  style?: StyleProp<ViewStyle>;
  /** Inner surface (padding, alignment, direction). */
  contentStyle?: StyleProp<ViewStyle>;
  onPress?: (e: GestureResponderEvent) => void;
  onLongPress?: (e: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'tab' | 'link' | 'none';
  accessibilityState?: { selected?: boolean; disabled?: boolean; checked?: boolean };
  /** Stretch to the parent's height — for cards that must match a sibling. */
  fill?: boolean;
  testID?: string;
}

const STOMP_SPRING = { damping: 18, stiffness: 420, mass: 0.5 };

/**
 * Neo-brutalist surface: 2px ink contour over a zero-blur offset block.
 * The shadow is a real layer rather than a shadow* prop because Android's
 * elevation can't draw hard offset shadows; this renders identically on
 * iOS, Android and web. Pressing "stomps" the surface into its shadow.
 */
const styles = StyleSheet.create({
  fill: { flex: 1 },
});

export const Tactile: React.FC<TactileProps> = ({
  children,
  offset = 4,
  radius = 24,
  backgroundColor,
  borderColor,
  borderWidth = 2,
  style,
  contentStyle,
  onPress,
  onLongPress,
  disabled,
  accessibilityLabel,
  accessibilityRole,
  accessibilityState,
  fill,
  testID,
}) => {
  const { colors } = useTheme();
  const press = useSharedValue(0);
  const interactive = !!(onPress || onLongPress) && !disabled;
  const travel = Math.max(0, offset - Math.min(offset, 2));

  const surfaceStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: press.value * travel }, { translateY: press.value * travel }],
  }));

  const surface = (
    <Animated.View
      style={[
        {
          backgroundColor: backgroundColor ?? colors.surface,
          borderColor: borderColor ?? colors.ink,
          borderWidth,
          borderRadius: radius,
        },
        fill && styles.fill,
        contentStyle,
        interactive && surfaceStyle,
      ]}
    >
      {children}
    </Animated.View>
  );

  return (
    <View style={[offset > 0 && { marginRight: offset, marginBottom: offset }, fill && styles.fill, style]}>
      {offset > 0 && (
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              top: offset,
              left: offset,
              right: -offset,
              bottom: -offset,
              borderRadius: radius,
              backgroundColor: colors.hardShadow,
            },
          ]}
        />
      )}
      {interactive ? (
        <Pressable
          onPress={onPress}
          onLongPress={onLongPress}
          onPressIn={() => {
            press.value = withSpring(1, STOMP_SPRING);
            haptics.light();
          }}
          onPressOut={() => {
            press.value = withSpring(0, STOMP_SPRING);
          }}
          accessibilityRole={accessibilityRole ?? 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityState={accessibilityState}
          testID={testID}
          style={fill ? styles.fill : undefined}
        >
          {surface}
        </Pressable>
      ) : (
        surface
      )}
    </View>
  );
};

