import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';

interface StreakWidgetProps {
  currentStreak: number;
  /** Retained for call-site compatibility; the ticket shows the raw count. */
  maxStreak?: number;
  onPress?: () => void;
  /** Outer style, so a bento row can stretch this to match its sibling. */
  style?: StyleProp<ViewStyle>;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

/**
 * StreakWidget — the Stitch "Atmosphere Streak" ticket stub: buttercup card
 * with punched side notches and a validation stamp.
 */
export const StreakWidget: React.FC<StreakWidgetProps> = ({ currentStreak, onPress, style }) => {
  const { colors } = useTheme();
  const pop = useSharedValue(0.86);

  useEffect(() => {
    pop.value = withDelay(120, withSpring(1, { damping: 12, stiffness: 180 }));
  }, [currentStreak]);

  const countStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const today = new Date();
  const stamp = `${MONTHS[today.getMonth()]} ${today.getDate()}`;

  return (
    <Tactile
      offset={4}
      radius={20}
      backgroundColor={colors.secondary}
      style={style}
      fill
      contentStyle={[styles.ticket, styles.fill]}
      onPress={onPress}
      accessibilityLabel={`Atmosphere streak, ${currentStreak} consecutive days`}
    >
      {/* punched notches — the canvas colour reads through as a cut-out */}
      <View style={[styles.notch, styles.notchLeft, { backgroundColor: colors.background, borderColor: colors.ink }]} />
      <View style={[styles.notch, styles.notchRight, { backgroundColor: colors.background, borderColor: colors.ink }]} />

      <Typography variant="overline" style={{ color: '#1E1E1E' }}>
        ATMOSPHERE STREAK
      </Typography>

      <Animated.View style={countStyle}>
        <Typography variant="display" style={styles.count}>
          {String(currentStreak).padStart(2, '0')}
        </Typography>
      </Animated.View>

      <Typography variant="overline" style={{ color: '#1E1E1E', opacity: 0.7 }}>
        CONSECUTIVE DAYS
      </Typography>

      <View style={[styles.dashed, { borderColor: '#1E1E1E' }]} />

      <View style={styles.stampRow}>
        <Typography variant="overline" style={{ color: '#1E1E1E', opacity: 0.7 }}>
          STAMP: {stamp}
        </Typography>
        <View style={[styles.validBadge, { backgroundColor: '#1E1E1E' }]}>
          <Typography variant="overline" style={{ color: colors.secondary }}>
            VALID
          </Typography>
        </View>
      </View>
    </Tactile>
  );
};

const styles = StyleSheet.create({
  ticket: {
    padding: 16,
    overflow: 'hidden',
  },
  fill: {
    flex: 1,
    justifyContent: 'center',
  },
  notch: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    top: '42%',
  },
  notchLeft: { left: -13 },
  notchRight: { right: -13 },
  count: {
    color: '#1E1E1E',
    marginVertical: 2,
  },
  dashed: {
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    opacity: 0.45,
    marginVertical: 10,
  },
  stampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  validBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
});
