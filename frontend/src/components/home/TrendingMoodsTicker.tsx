import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withSpring } from 'react-native-reanimated';
import { springs, getEmotionConfig, emotionInk, inkOnPastel } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { haptics } from '@/theme/haptics';

interface TrendItem {
  emotion: string;
  changePercent: number; // positive = trending up
  /** Sticker title, e.g. "Caffeine Rush". Falls back to the mood label. */
  label?: string;
  /** Where it's resonating, e.g. "Echoing in 31 cafés". */
  caption?: string;
}

interface TrendingMoodsTickerProps {
  trends: TrendItem[];
  onEmotionPress?: (emotion: string) => void;
}

/**
 * A dashed sticker, tilted on the page and lifted off it by a hard ink block.
 * Tapping stamps it — and straightens it, the way Stitch's sticker unrotates
 * on hover.
 */
const StampSticker: React.FC<{
  item: TrendItem;
  tilt: number;
  onPress?: () => void;
}> = ({ item, tilt, onPress }) => {
  const { colors, isDark } = useTheme();
  const [stamped, setStamped] = useState(false);
  const scale = useSharedValue(1);
  const config = getEmotionConfig(item.emotion);
  const ink = emotionInk(config, isDark);
  const rising = item.changePercent >= 0;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${stamped ? 0 : tilt}deg` }, { scale: scale.value }],
  }));

  const handlePress = () => {
    if (!stamped) {
      setStamped(true);
      haptics.success();
    } else {
      haptics.light();
    }
    scale.value = withSequence(withSpring(0.94, springs.stiff), withSpring(1, springs.stiff));
    onPress?.();
  };

  return (
    <Animated.View style={[styles.stickerCell, animStyle]}>
      {/* hard ink block — Stitch's shadow-[3px_3px_0px] */}
      <View style={[styles.stickerShadow, { backgroundColor: colors.hardShadow }]} pointerEvents="none" />

      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ selected: stamped }}
        accessibilityLabel={`${item.label ?? config.label}, ${rising ? 'up' : 'down'} ${Math.abs(item.changePercent)} percent in 24 hours`}
        style={[
          styles.sticker,
          { borderColor: colors.ink, backgroundColor: stamped ? config.background : colors.surface },
        ]}
      >
        <View style={styles.stickerTop}>
          <MoodGlyph mood={toMoodKey(item.emotion)} size={24} color={ink} />
          <View style={[styles.countBadge, { backgroundColor: config.primary, borderColor: colors.ink }]}>
            <Typography variant="overline" style={{ color: inkOnPastel }}>
              {rising ? '+' : '−'}{Math.abs(item.changePercent)}%
            </Typography>
          </View>
        </View>

        <Typography variant="h4" numberOfLines={1} style={{ color: colors.textPrimary, marginTop: 8 }}>
          {item.label ?? config.label}
        </Typography>
        <Typography variant="caption" numberOfLines={2} style={{ color: colors.textMuted, marginTop: 2 }}>
          {item.caption ?? `${rising ? 'Rising' : 'Softening'} across the map in 24h`}
        </Typography>

        {stamped && (
          <View style={[styles.stampedMark, { borderColor: ink }]}>
            <Typography variant="overline" style={{ color: ink }}>
              STAMPED
            </Typography>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

/**
 * TrendingMoodsTicker — the Stitch "Community Resonance" board: a two-up grid
 * of tilted dashed stickers you tap to stamp, which also filters the feed.
 */
export const TrendingMoodsTicker: React.FC<TrendingMoodsTickerProps> = ({ trends, onEmotionPress }) => {
  const { colors } = useTheme();

  return (
    <View>
      <View style={styles.header}>
        <Typography variant="h4" style={{ color: colors.textPrimary }}>
          Community Resonance
        </Typography>
        <View style={[styles.hintBadge, { borderColor: colors.ink, backgroundColor: colors.secondary }]}>
          <Typography variant="overline" style={{ color: inkOnPastel }}>
            TAP TO STAMP
          </Typography>
        </View>
      </View>

      <View style={styles.grid}>
        {trends.slice(0, 4).map((item, i) => (
          <StampSticker
            key={item.emotion}
            item={item}
            tilt={i % 2 === 0 ? -2 : 2}
            onPress={() => onEmotionPress?.(item.emotion)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  hintBadge: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stickerCell: {
    width: '47%',
    marginBottom: 14,
    marginRight: 3,
  },
  stickerShadow: {
    position: 'absolute',
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    borderRadius: 14,
  },
  sticker: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    minHeight: 118,
  },
  stickerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countBadge: {
    borderWidth: 2,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  stampedMark: {
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 8,
    transform: [{ rotate: '-6deg' }],
  },
});
