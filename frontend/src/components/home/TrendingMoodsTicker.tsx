import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { colors, springs, shadows, getEmotionConfig } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { haptics } from '@/theme/haptics';

interface TrendItem {
  emotion: string;
  changePercent: number; // positive = trending up
}

interface TrendingMoodsTickerProps {
  trends: TrendItem[];
  onEmotionPress?: (emotion: string) => void;
}

const TrendPill: React.FC<{
  item: TrendItem;
  onPress?: () => void;
}> = ({ item, onPress }) => {
  const scale = useSharedValue(1);
  const config = getEmotionConfig(item.emotion);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.93, springs.stiff);
    haptics.light();
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const isUp = item.changePercent >= 0;

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View
        style={[
          styles.pill,
          { borderColor: config.border },
          shadows.neonEdge(config.primary),
          animatedStyle,
        ]}
      >
        <Typography variant="body" style={{ marginRight: 6 }}>
          {config.emoji}
        </Typography>
        <Typography variant="caption" weight="semibold" style={{ color: colors.textPrimary }}>
          {config.label}
        </Typography>
        <View
          style={[
            styles.badge,
            { backgroundColor: isUp ? colors.successLight : colors.errorLight },
          ]}
        >
          <Typography
            variant="caption"
            weight="bold"
            style={{ color: isUp ? colors.success : colors.error, fontSize: 10 }}
          >
            {isUp ? '↑' : '↓'} {Math.abs(item.changePercent)}%
          </Typography>
        </View>
      </Animated.View>
    </Pressable>
  );
};

/**
 * TrendingMoodsTicker — horizontal scrolling row of emotion trend pills
 * Auto-scrolls slowly, pauses on touch interaction
 */
export const TrendingMoodsTicker: React.FC<TrendingMoodsTickerProps> = ({
  trends,
  onEmotionPress,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const scrollXRef = useRef(0);
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  useEffect(() => {
    autoScrollTimer.current = setInterval(() => {
      if (!isPaused.current && scrollRef.current) {
        scrollXRef.current += 1;
        scrollRef.current.scrollTo({ x: scrollXRef.current, animated: false });
      }
    }, 40);

    return () => {
      if (autoScrollTimer.current) clearInterval(autoScrollTimer.current);
    };
  }, []);

  const handleScrollBeginDrag = () => {
    isPaused.current = true;
  };

  const handleScrollEndDrag = () => {
    // Resume auto-scroll after 3 seconds
    setTimeout(() => {
      isPaused.current = false;
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Typography variant="overline" style={styles.sectionLabel}>
        TRENDING
      </Typography>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onScroll={(e) => {
          scrollXRef.current = e.nativeEvent.contentOffset.x;
        }}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {trends.map((item) => (
          <TrendPill
            key={item.emotion}
            item={item}
            onPress={() => onEmotionPress?.(item.emotion)}
          />
        ))}
        {/* Duplicate for infinite scroll illusion */}
        {trends.map((item) => (
          <TrendPill
            key={`dup-${item.emotion}`}
            item={item}
            onPress={() => onEmotionPress?.(item.emotion)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  sectionLabel: {
    color: colors.textMuted,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});
