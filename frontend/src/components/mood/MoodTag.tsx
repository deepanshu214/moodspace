import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { emotionInk, inkOnPastel } from '@/theme/colors';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';

export interface MoodTagProps {
  emotion: string;
  secondaryEmotion?: string;
  intensity?: number;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const MoodTag: React.FC<MoodTagProps> = ({
  emotion,
  secondaryEmotion,
  intensity,
  size = 'md',
  selected = false,
  onPress,
  style,
}) => {
  const { isDark } = useTheme();
  const config = theme.getEmotionConfig(emotion);
  // A selected tag is filled with the solid pastel, where only espresso stays legible.
  const ink = selected ? inkOnPastel : emotionInk(config, isDark);

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 3, paddingHorizontal: 8 };
      case 'lg':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'md':
      default:
        return { paddingVertical: 5, paddingHorizontal: 12 };
    }
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    borderColor: selected ? config.primary : config.border,
    backgroundColor: selected ? config.primary : config.background,
    ...getPadding(),
  };

  const content = (
    <>
      <Typography variant={size === 'lg' ? 'body' : 'bodySmall'} style={styles.emoji}>
        {config.emoji}
      </Typography>

      <Typography
        variant={size === 'sm' ? 'caption' : size === 'lg' ? 'title' : 'bodySmall'}
        weight="semibold"
        color={ink}
      >
        {config.label}
        {secondaryEmotion ? ` • ${secondaryEmotion}` : ''}
      </Typography>

      {intensity !== undefined && (
        <View
          style={[
            styles.intensityBadge,
            {
              backgroundColor: selected ? 'rgba(255, 255, 255, 0.25)' : config.glow,
            },
          ]}
        >
          <Typography
            variant="caption"
            weight="bold"
            color={ink}
            style={styles.intensityText}
          >
            {intensity}
          </Typography>
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[containerStyle, style]}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[containerStyle, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  emoji: {
    marginRight: 6,
  },
  intensityBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  intensityText: {
    fontSize: 10,
    lineHeight: 12,
  },
});
