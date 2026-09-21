import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/context';
import { getEmotionConfig, emotionInk, springs } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { storage } from '@/utils/storage';
import { haptics } from '@/theme/haptics';

const ROLL_KEY = 'moodspace_lucky_vibe_roll';

export interface LuckyVibe {
  title: string;
  description: string;
  emotion: string;
}

/** The roll deck. Each vibe is a named atmosphere the community is sharing. */
export const LUCKY_VIBES: LuckyVibe[] = [
  { title: 'Midnight Golden Hour', description: 'Warm lamplight, slow music, and nowhere else to be.', emotion: 'joy' },
  { title: 'Rain on the Window', description: 'Grey skies outside, something steady and kind inside.', emotion: 'sadness' },
  { title: 'First Coffee Static', description: 'The buzzing half-hour where the day has not decided yet.', emotion: 'excitement' },
  { title: 'Library Hush', description: 'Pages turning somewhere behind you. Nothing urgent.', emotion: 'calm' },
  { title: 'Open Window Breeze', description: 'Air moving through the room for the first time all week.', emotion: 'calm' },
  { title: 'Late Train Window', description: 'Cities blurring past while your thoughts catch up.', emotion: 'loneliness' },
  { title: 'Kitchen Dancing', description: 'Dinner half-made, the good song on, no one watching.', emotion: 'love' },
  { title: 'Pre-Storm Electricity', description: 'The pressure drop before everything finally breaks.', emotion: 'anxiety' },
];

interface LuckyVibeCardProps {
  onVibePress?: (emotion: string) => void;
}

/** Deterministic pseudo-metrics so a given roll always reads the same. */
const metricsFor = (index: number, roll: number) => {
  const seed = (index * 37 + roll * 13) % 100;
  return {
    synchronicity: (82 + (seed % 17) + (seed % 10) / 10).toFixed(1),
    amplitude: (1.2 + (seed % 40) / 10).toFixed(1),
  };
};

/**
 * LuckyVibeCard — the Stitch "Lucky Vibe" deck: a rollable atmosphere card
 * with a synchronicity read-out. The roll counter persists between sessions.
 */
export const LuckyVibeCard: React.FC<LuckyVibeCardProps> = ({ onVibePress }) => {
  const { colors, isDark } = useTheme();
  const [roll, setRoll] = useState(1);
  const [index, setIndex] = useState(0);
  const flip = useSharedValue(1);

  useEffect(() => {
    let alive = true;
    storage.getItem(ROLL_KEY).then((raw) => {
      if (!alive) return;
      const stored = Number(raw);
      if (Number.isFinite(stored) && stored > 0) {
        setRoll(stored);
        setIndex(stored % LUCKY_VIBES.length);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const handleRoll = useCallback(() => {
    haptics.success();
    const next = roll + 1;
    setRoll(next);
    setIndex(next % LUCKY_VIBES.length);
    storage.setItem(ROLL_KEY, String(next));
    flip.value = withSequence(withTiming(0.2, { duration: 110 }), withSpring(1, springs.pillowy));
  }, [roll]);

  const vibe = LUCKY_VIBES[index];
  const config = getEmotionConfig(vibe.emotion);
  const ink = emotionInk(config, isDark);
  const { synchronicity, amplitude } = metricsFor(index, roll);

  const bodyStyle = useAnimatedStyle(() => ({ opacity: flip.value }));

  return (
    <Tactile offset={4} radius={24} contentStyle={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.rollBadge, { backgroundColor: colors.secondary, borderColor: colors.ink }]}>
          <MoodGlyph mood={toMoodKey(vibe.emotion)} size={13} color="#1E1E1E" />
          <Typography variant="overline" style={{ color: '#1E1E1E', marginLeft: 5 }}>
            LUCKY VIBE #{String(roll).padStart(2, '0')}
          </Typography>
        </View>
        <Tactile
          offset={2}
          radius={12}
          backgroundColor={colors.primary}
          contentStyle={styles.rollButton}
          onPress={handleRoll}
          accessibilityLabel="Roll a new lucky vibe"
        >
          <Typography variant="overline" style={{ color: '#1E1E1E' }}>
            ROLL
          </Typography>
        </Tactile>
      </View>

      <Animated.View style={bodyStyle}>
        <Typography variant="h3" style={{ color: colors.textPrimary, marginTop: 12 }}>
          {vibe.title}
        </Typography>
        <Typography variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 4 }}>
          {vibe.description}
        </Typography>
      </Animated.View>

      <View style={[styles.dashed, { borderColor: colors.border }]} />

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          <Typography variant="overline" style={{ color: colors.textSecondary }}>
            SYNCHRONICITY {synchronicity}%
          </Typography>
        </View>
        <Typography variant="overline" style={{ color: ink }}>
          AMPLITUDE +{amplitude}dB
        </Typography>
      </View>
    </Tactile>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rollBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  rollButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  dashed: {
    borderBottomWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 14,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
});
