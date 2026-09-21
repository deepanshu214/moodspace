import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '@/context';
import { getEmotionConfig } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';

export interface MoodPinTagProps {
  /** City or place label, e.g. "Tokyo". */
  label: string;
  /** Trailing metric, e.g. "+96" or "84%". */
  metric?: string;
  emotion: string;
  onPress?: () => void;
}

/**
 * MoodPinTag — the Stitch map pin: a mood-filled label tag over a hard ink
 * shadow, tethered to a small dot marking the exact point.
 */
export const MoodPinTag: React.FC<MoodPinTagProps> = ({ label, metric, emotion, onPress }) => {
  const { colors } = useTheme();
  const config = getEmotionConfig(emotion);

  return (
    <Pressable
      onPress={() => {
        haptics.light();
        onPress?.();
      }}
      accessibilityRole="button"
      accessibilityLabel={`${label}${metric ? ` ${metric}` : ''}, ${config.label}`}
      style={styles.wrap}
    >
      <View style={styles.tagStack}>
        <View style={[styles.shadow, { backgroundColor: colors.hardShadow }]} />
        <View style={[styles.tag, { backgroundColor: config.primary, borderColor: colors.ink }]}>
          <Typography variant="overline" numberOfLines={1} style={{ color: '#1E1E1E' }}>
            {label}
            {metric ? ` ${metric}` : ''}
          </Typography>
        </View>
      </View>
      <View style={[styles.stem, { backgroundColor: colors.ink }]} />
      <View style={[styles.dot, { backgroundColor: config.primary, borderColor: colors.ink }]} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  tagStack: {
    marginRight: 2,
    marginBottom: 2,
  },
  shadow: {
    position: 'absolute',
    top: 2,
    left: 2,
    right: -2,
    bottom: -2,
    borderRadius: 6,
  },
  tag: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  stem: {
    width: 2,
    height: 6,
    opacity: 0.6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
});
