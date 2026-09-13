import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Button } from './Button';
import { Ionicons } from '@expo/vector-icons';

export interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
  title: string;
  description?: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'planet-outline',
  emoji,
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const floatY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(6, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedFloatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.iconCircle, animatedFloatStyle]}>
        {emoji ? (
          <Typography variant="display">{emoji}</Typography>
        ) : (
          <Ionicons name={iconName} size={42} color={theme.colors.primaryLight} />
        )}
      </Animated.View>

      <Typography variant="h3" weight="semibold" align="center" style={styles.title}>
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.description}
        >
          {description}
        </Typography>
      )}

      {actionTitle && onAction && (
        <Button
          title={actionTitle}
          onPress={onAction}
          variant="primary"
          style={styles.actionBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    marginVertical: theme.spacing.xxxl,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    marginBottom: theme.spacing.xs,
  },
  description: {
    maxWidth: 280,
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    marginTop: theme.spacing.sm,
  },
});
