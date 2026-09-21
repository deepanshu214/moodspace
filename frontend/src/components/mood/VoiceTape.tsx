import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useTheme } from '@/context';
import { inkOnPastel } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';

const formatTime = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

/** A reel that turns only while the tape is playing. */
const Reel: React.FC<{ spinning: boolean; color: string; border: string }> = ({ spinning, color, border }) => {
  const angle = useSharedValue(0);

  useEffect(() => {
    if (spinning) {
      angle.value = withRepeat(withTiming(360, { duration: 2400, easing: Easing.linear }), -1, false);
    } else {
      cancelAnimation(angle);
    }
  }, [spinning]);

  const style = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  return (
    <Animated.View style={[styles.reel, { backgroundColor: color, borderColor: border }, style]}>
      {/* three short spokes around a hub read as a tape reel rather than a "+" */}
      <View style={[styles.reelSpoke, { backgroundColor: border }]} />
      <View style={[styles.reelSpoke, { backgroundColor: border, transform: [{ rotate: '60deg' }] }]} />
      <View style={[styles.reelSpoke, { backgroundColor: border, transform: [{ rotate: '120deg' }] }]} />
      <View style={[styles.reelHub, { backgroundColor: border }]} />
    </Animated.View>
  );
};

export interface VoiceTapeProps {
  uri: string;
  /** Recorded length, used until the player reports its own duration. */
  durationMs?: number;
  tint: string;
}

/**
 * VoiceTape — the Stitch "field tape" block. Real playback: the reels spin
 * while audio runs and the progress bar tracks the actual position.
 */
export const VoiceTape: React.FC<VoiceTapeProps> = ({ uri, durationMs, tint }) => {
  const { colors } = useTheme();
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const playing = !!status?.playing;
  const positionMs = (status?.currentTime ?? 0) * 1000;
  const totalMs = status?.duration ? status.duration * 1000 : durationMs ?? 0;
  const progress = totalMs > 0 ? Math.min(1, positionMs / totalMs) : 0;

  const toggle = () => {
    haptics.light();
    if (playing) {
      player.pause();
      return;
    }
    // Replaying after the end needs an explicit rewind.
    if (totalMs > 0 && positionMs >= totalMs - 250) {
      player.seekTo(0);
    }
    player.play();
  };

  return (
    <View style={[styles.tape, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}>
      <View style={styles.tapeHeader}>
        <Typography variant="overline" style={{ color: colors.textPrimary }}>
          SIDE A // FIELD TAPE
        </Typography>
        <View style={[styles.khzChip, { borderColor: colors.ink, backgroundColor: colors.surface }]}>
          <Typography variant="overline" style={{ color: colors.textSecondary }}>
            44.1 kHz
          </Typography>
        </View>
      </View>

      <View style={styles.tapeBody}>
        <TouchableOpacity
          onPress={toggle}
          style={[styles.playBtn, { backgroundColor: tint, borderColor: colors.ink }]}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause voice note' : 'Play voice note'}
        >
          <Ionicons name={playing ? 'pause' : 'play'} size={16} color={inkOnPastel} />
        </TouchableOpacity>

        <View style={styles.reels}>
          <Reel spinning={playing} color={colors.surface} border={colors.ink} />
          <Reel spinning={playing} color={colors.surface} border={colors.ink} />
        </View>

        <Typography variant="overline" style={{ color: colors.textSecondary }}>
          {formatTime(positionMs)} / {formatTime(totalMs)}
        </Typography>
      </View>

      <View style={[styles.track, { backgroundColor: colors.surface, borderColor: colors.ink }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: tint }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tape: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 10,
    marginTop: 12,
  },
  tapeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  khzChip: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  tapeBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reels: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
  },
  reel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    marginHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reelSpoke: {
    position: 'absolute',
    width: 1.5,
    height: 16,
    opacity: 0.55,
  },
  reelHub: {
    position: 'absolute',
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  track: {
    height: 8,
    borderRadius: 999,
    borderWidth: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
