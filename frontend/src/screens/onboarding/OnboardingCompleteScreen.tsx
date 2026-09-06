import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingComplete'>;

export const OnboardingCompleteScreen: React.FC<Props> = () => {
  const { completeOnboarding } = useAuthStore();

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.orb}>
          <Typography variant="display">✨</Typography>
        </View>

        <Typography variant="h1" weight="heavy" align="center" style={styles.title}>
          Your Aura is Ready
        </Typography>

        <Typography
          variant="bodyLarge"
          color={theme.colors.textSecondary}
          align="center"
          style={styles.subtitle}
        >
          Welcome to your space. You can now explore the global emotional map, share floating
          bubbles, and connect with souls on similar journeys.
        </Typography>
      </View>

      <Button
        title="Enter MoodSpace 🚀"
        variant="primary"
        fullWidth
        size="lg"
        onPress={completeOnboarding}
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
    marginBottom: theme.spacing.xxl,
    ...theme.shadows.glow(theme.colors.primary, 0.5),
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    maxWidth: 300,
    lineHeight: 24,
  },
  enterBtn: {
    marginBottom: theme.spacing.lg,
  },
});
