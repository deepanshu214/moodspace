import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Mascot } from '@/components/common/Mascot';
import { MoodSpaceLogo } from '@/components/common/MoodSpaceLogo';

/** One aura ring that swells and fades behind the mascot. */
const AuraRipple: React.FC<{ size: number; color: string; delay: number; duration: number }> = ({
  size,
  color,
  delay,
  duration,
}) => {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }), -1, true));
  }, []);

  const style = useAnimatedStyle(() => ({
    // Kept low: on the obsidian canvas a strong tint muddies into brown.
    opacity: 0.3 - 0.18 * t.value,
    transform: [{ scale: 0.85 + 0.3 * t.value }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
};

export interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
  /** Shows a close affordance in the top-right when provided. */
  onClose?: () => void;
}

/**
 * LoadingScreen — the Stitch "cute loading" screen: aura ripples behind the
 * Droplet mascot, warm copy, and a shimmering indeterminate progress bar.
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = 'Gathering good vibes...',
  subtitle = 'Finding warm frequencies near you',
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const shimmer = useSharedValue(-1);

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, false);
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value * 176 }],
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {onClose && (
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeBtn, { backgroundColor: colors.surface, borderColor: colors.ink }]}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
      )}

      <View style={styles.center}>
        <View style={styles.stage} accessibilityRole="progressbar" accessibilityLabel={title}>
          <AuraRipple size={192} color={colors.primaryLight} delay={0} duration={2600} />
          <AuraRipple size={144} color={colors.secondary} delay={600} duration={2000} />
          <View
            style={[
              styles.innerGlow,
              { backgroundColor: isDark ? colors.surfaceElevated : colors.surfaceWarm, opacity: isDark ? 0.35 : 0.7 },
            ]}
          />
          <Mascot size={112} />
        </View>

        <Typography variant="h3" align="center" style={{ color: colors.textPrimary }}>
          {title}
        </Typography>
        <Typography variant="bodySmall" align="center" style={{ color: colors.textSecondary, marginTop: 6 }}>
          {subtitle}
        </Typography>

        <View style={[styles.track, { backgroundColor: colors.surfaceElevated, borderColor: colors.ink }]}>
          <Animated.View style={[styles.shimmer, shimmerStyle]}>
            <LinearGradient
              colors={[colors.primary, colors.secondary, colors.primary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1 }}
            />
          </Animated.View>
        </View>
      </View>

      <View style={styles.footer}>
        <MoodSpaceLogo size={20} showBackground={false} animated={false} />
        <Typography variant="overline" style={{ color: colors.textMuted, marginLeft: 6 }}>
          MOODSPACE
        </Typography>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  closeBtn: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    width: 208,
    height: 208,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ripple: {
    position: 'absolute',
  },
  innerGlow: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  track: {
    width: 176,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
    overflow: 'hidden',
    marginTop: 24,
  },
  shimmer: {
    width: 88,
    height: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
