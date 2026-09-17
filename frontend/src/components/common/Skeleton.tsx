import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { useTheme } from '@/context';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  circle?: boolean;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 16,
  borderRadius = theme.radius.sm,
  circle = false,
  style,
}) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const actualWidth = circle ? height : width;
  const actualRadius = circle && typeof height === 'number' ? height / 2 : borderRadius;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: actualWidth,
          height,
          borderRadius: actualRadius,
          backgroundColor: colors.surfaceHighlight,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const { colors } = useTheme();
  return (
  <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }, style]}>
    <View style={styles.headerRow}>
      <Skeleton circle height={40} />
      <View style={styles.headerTexts}>
        <Skeleton width="50%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="30%" height={10} />
      </View>
    </View>
    <Skeleton width="100%" height={16} style={{ marginTop: 12, marginBottom: 6 }} />
    <Skeleton width="85%" height={16} style={{ marginBottom: 6 }} />
    <Skeleton width="60%" height={16} />
  </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {},
  cardContainer: {
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
});
