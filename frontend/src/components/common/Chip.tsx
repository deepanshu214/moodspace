import React from 'react';
import {
  Pressable,
  View,
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
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

export interface ChipProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  emoji?: string;
  onRemove?: () => void;
  emotion?: string;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  icon,
  emoji,
  onRemove,
  emotion,
  style,
  onPress,
}) => {
  const emotionConfig = emotion ? theme.getEmotionConfig(emotion) : null;
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.95, theme.springs.snappy);
      haptics.selection();
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

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.xs + 2,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      alignSelf: 'flex-start',
    };

    if (emotionConfig) {
      if (selected) {
        base.backgroundColor = emotionConfig.primary;
        base.borderColor = emotionConfig.primary;
      } else {
        base.backgroundColor = emotionConfig.background;
        base.borderColor = emotionConfig.border;
      }
      return base;
    }

    if (selected) {
      base.backgroundColor = theme.colors.primary;
      base.borderColor = theme.colors.primary;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (selected) return '#FFFFFF';
    if (emotionConfig) return emotionConfig.primary;
    return theme.colors.textSecondary;
  };

  const content = (
    <>
      {emoji && (
        <Typography variant="bodySmall" style={styles.emoji}>
          {emoji}
        </Typography>
      )}
      {icon && <View style={styles.icon}>{icon}</View>}
      <Typography variant="caption" weight={selected ? 'bold' : 'medium'} color={getTextColor()}>
        {label}
      </Typography>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.removeBtn}
        >
          <Ionicons
            name="close"
            size={14}
            color={selected ? '#FFFFFF' : theme.colors.textMuted}
          />
        </Pressable>
      )}
    </>
  );

  if (onPress) {
    return (
      <Animated.View style={animatedStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[getContainerStyle(), style as any]}
        >
          {content}
        </Pressable>
      </Animated.View>
    );
  }

  return <View style={[getContainerStyle(), style]}>{content}</View>;
};

const styles = StyleSheet.create({
  emoji: {
    marginRight: theme.spacing.xs,
  },
  icon: {
    marginRight: theme.spacing.xs,
  },
  removeBtn: {
    marginLeft: theme.spacing.xs + 2,
  },
});
