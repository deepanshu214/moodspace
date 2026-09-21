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
      borderRadius: 20,
      padding: theme.spacing[padding],
      position: 'relative',
      overflow: 'hidden',
    };

    switch (variant) {
      // Neo-Editorial: every card is a 2px ink contour on a paper surface.
      case 'flat':
        base.backgroundColor = colors.surface;
        base.borderWidth = 2;
        base.borderColor = colors.border;
        break;
      case 'outlined':
        base.backgroundColor = 'transparent';
        base.borderWidth = 2;
        base.borderColor = colors.ink;
        break;
      case 'glass':
        base.backgroundColor = colors.surface;
        base.borderWidth = 2;
        base.borderColor = colors.border;
        break;
      case 'elevated':
      default:
        base.backgroundColor = colors.surface;
        base.borderWidth = 2;
        base.borderColor = colors.ink;
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
