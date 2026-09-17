import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
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
import { useTheme } from '@/context';
import { haptics } from '@/theme/haptics';

export type CardVariant = 'elevated' | 'flat' | 'outlined' | 'glass';

export interface CardProps {
  variant?: CardVariant;
  emotion?: string;
  padding?: keyof typeof theme.spacing;
  showAccentStrip?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  emotion,
  padding = 'lg',
  showAccentStrip = false,
  onPress,
  style,
  children,
}) => {
  const { colors } = useTheme();
  const emotionConfig = emotion ? theme.getEmotionConfig(emotion) : null;
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, theme.springs.snappy);
      haptics.light();
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, theme.springs.bouncy);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getCardStyle = (): ViewStyle => {
    let base: ViewStyle = {
      borderRadius: theme.radius.lg,
      padding: theme.spacing[padding],
      position: 'relative',
      overflow: 'hidden',
    };

    switch (variant) {
      case 'flat':
        base.backgroundColor = colors.surface;
        break;
      case 'outlined':
        base.backgroundColor = 'transparent';
        base.borderWidth = 1;
        base.borderColor = colors.border;
        break;
      case 'glass':
        base.backgroundColor = 'rgba(23, 24, 34, 0.75)';
        base.borderWidth = 1;
        base.borderColor = 'rgba(255, 255, 255, 0.08)';
        break;
      case 'elevated':
      default:
        base.backgroundColor = colors.surfaceElevated;
        base.borderWidth = 1;
        base.borderColor = colors.border;
        Object.assign(base, theme.shadows.card);
        break;
    }

    if (emotionConfig) {
      base.borderColor = emotionConfig.border;
      base.backgroundColor = emotionConfig.background;
    }

    return base;
  };

  const content = (
    <>
      {(showAccentStrip || emotion) && emotionConfig && (
        <View
          style={[
            styles.accentStrip,
            { backgroundColor: emotionConfig.primary },
          ]}
        />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[getCardStyle(), style as any]}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={[getCardStyle(), style]}>{content}</View>;
};

const styles = StyleSheet.create({
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
});
