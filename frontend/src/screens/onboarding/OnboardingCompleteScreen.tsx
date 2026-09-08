import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { AuraDisplay } from '@/components/social/AuraDisplay';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingComplete'>;

export const OnboardingCompleteScreen: React.FC<Props> = () => {
  const { user, completeOnboarding } = useAuthStore();
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedOrbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleEnter = async () => {
    await completeOnboarding();
  };

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <Animated.View style={[styles.orb, animatedOrbStyle]}>
          <Typography variant="display">✨</Typography>
        </Animated.View>

        <Typography variant="h1" weight="heavy" align="center" style={styles.title}>
          Welcome, {user?.displayName || 'Soul Explorer'}
        </Typography>

        <Typography
          variant="bodyLarge"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Your aura has been calibrated. You are now part of a living map where emotions are
          expressed without judgment.
        </Typography>

        <View style={styles.auraPreview}>
          <AuraDisplay score={user?.auraScore || 150} variant="badge" />
        </View>
      </View>

      <Button
        title="Enter MoodSpace 🚀"
        variant="primary"
        fullWidth
        size="lg"
        onPress={handleEnter}
        style={styles.enterBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2.5,
    borderColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow(theme.colors.primary, 0.5),
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  auraPreview: {
    marginTop: theme.spacing.md,
  },
  enterBtn: {
    marginBottom: theme.spacing.lg,
  },
});
