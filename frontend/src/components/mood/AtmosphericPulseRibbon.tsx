import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '../common/Typography';
import { Ionicons } from '@expo/vector-icons';

export interface AtmosphericPulseRibbonProps {
  dominantEmotion?: string;
  intensityAverage?: number;
  activeBubblesCount?: number;
  selectedFilter: string | null;
  onSelectFilter: (filter: string | null) => void;
  onRecenterPress?: () => void;
  onStreamPress?: () => void;
  onCirclesPress?: () => void;
  onTourPress?: () => void;
}

const emotionFilters = [
  { id: null, label: 'All Feelings', emoji: '🌍' },
  { id: 'joy', label: 'Joy', emoji: '✨' },
  { id: 'calm', label: 'Calm', emoji: '🌊' },
  { id: 'anxiety', label: 'Anxiety', emoji: '⚡' },
  { id: 'love', label: 'Love', emoji: '💖' },
  { id: 'sadness', label: 'Sadness', emoji: '🌧️' },
  { id: 'excitement', label: 'Excitement', emoji: '🎉' },
];

export const AtmosphericPulseRibbon: React.FC<AtmosphericPulseRibbonProps> = ({
  dominantEmotion = 'calm',
  intensityAverage = 7.2,
  activeBubblesCount = 142,
  selectedFilter,
  onSelectFilter,
  onRecenterPress,
  onStreamPress,
  onCirclesPress,
  onTourPress,
}) => {
  const { colors } = useTheme();
  const emotionConfig = theme.getEmotionConfig(dominantEmotion);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.4);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );

    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedPulse = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.wrapper}>
      {/* Top Floating Glass Card */}
      <View style={styles.topCard}>
        <View style={styles.leftMeta}>
          {/* Animated Atmospheric Indicator */}
          <View style={styles.indicatorContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                { backgroundColor: emotionConfig.glow },
                animatedPulse,
              ]}
            />
            <View style={[styles.pulseDot, { backgroundColor: emotionConfig.primary }]}>
              <Typography variant="caption">{emotionConfig.emoji}</Typography>
            </View>
          </View>

          <View style={styles.titleColumn}>
            <View style={styles.titleRow}>
              <Typography variant="bodySmall" weight="bold" color={colors.textPrimary}>
                Today's Mood: {emotionConfig.label}
              </Typography>
              <View style={styles.badgePill}>
                <Typography variant="caption" weight="bold" color={emotionConfig.primary}>
                  {intensityAverage} / 10
                </Typography>
              </View>
            </View>

            <Typography variant="caption" color={colors.textMuted}>
              {activeBubblesCount} check-ins around the world
            </Typography>
          </View>
        </View>

        <View style={styles.rightActionsRow}>
          {onTourPress && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onTourPress}
              style={styles.recenterBtn}
              accessibilityLabel="App Tour Guide"
            >
              <Ionicons name="help-circle-outline" size={19} color={colors.primaryLight} />
            </TouchableOpacity>
          )}

          {onCirclesPress && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onCirclesPress}
              style={styles.recenterBtn}
              accessibilityLabel="Community Circles"
            >
              <Ionicons name="planet-outline" size={18} color={colors.primaryLight} />
            </TouchableOpacity>
          )}

          {onStreamPress && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onStreamPress}
              style={styles.recenterBtn}
              accessibilityLabel="Feed Stream"
            >
              <Ionicons name="list" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          {onRecenterPress && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={onRecenterPress}
              style={styles.recenterBtn}
              accessibilityLabel="Recenter Map"
            >
              <Ionicons name="locate" size={18} color={colors.primaryLight} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Emotion Filter Ribbon */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {emotionFilters.map((item) => {
          const isSelected = selectedFilter === item.id;
          const itemConfig = item.id ? theme.getEmotionConfig(item.id) : null;
          const activeBorder = itemConfig ? itemConfig.primary : colors.primaryLight;
          const activeBg = itemConfig ? itemConfig.background : 'rgba(108, 92, 231, 0.2)';

          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => onSelectFilter(item.id)}
              style={[
                styles.filterPill,
                isSelected && {
                  borderColor: activeBorder,
                  backgroundColor: activeBg,
                  shadowColor: activeBorder,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.4,
                  shadowRadius: 6,
                },
              ]}
            >
              <Typography variant="bodySmall" style={styles.filterEmoji}>
                {item.emoji}
              </Typography>
              <Typography
                variant="caption"
                weight={isSelected ? 'bold' : 'medium'}
                color={isSelected ? '#FFFFFF' : colors.textSecondary}
              >
                {item.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 52,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  topCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(17, 20, 34, 0.88)',
    borderRadius: theme.radius.xl,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(50, 54, 77, 0.8)',
    ...theme.shadows.elevated,
  },
  leftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicatorContainer: {
    position: 'relative',
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  pulseRing: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  pulseDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  titleColumn: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgePill: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  rightActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recenterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(50, 54, 77, 0.8)',
  },
  filterEmoji: {
    marginRight: 5,
  },
});
