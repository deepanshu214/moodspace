import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { toggleDemoAuth } = useAuthStore();

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        <View style={styles.heroSection}>
          <View style={styles.orb}>
            <Typography variant="display">🌌</Typography>
          </View>
          <Typography variant="h1" weight="heavy" align="center" style={styles.title}>
            Welcome to MoodSpace
          </Typography>
          <Typography
            variant="bodyLarge"
            color={theme.colors.textSecondary}
            align="center"
            style={styles.subtitle}
          >
            A safe emotional atmosphere where feelings become shared landscapes.
          </Typography>
        </View>

        <View style={styles.actionsSection}>
          <Button
            title="Create Account"
            variant="primary"
            fullWidth
            size="lg"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryBtn}
          />
          <Button
            title="I Already Have an Account"
            variant="secondary"
            fullWidth
            size="md"
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryBtn}
          />

          <Button
            title="⚡ Quick Preview Demo"
            variant="ghost"
            fullWidth
            size="sm"
            onPress={toggleDemoAuth}
            style={styles.demoBtn}
          />
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xl,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: theme.spacing.xxxl,
  },
  orb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 2,
    borderColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    ...theme.shadows.glow(theme.colors.primary, 0.4),
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    maxWidth: 300,
    lineHeight: 24,
  },
  actionsSection: {
    width: '100%',
    gap: 12,
  },
  primaryBtn: {
    marginBottom: 4,
  },
  secondaryBtn: {
    marginBottom: 4,
  },
  demoBtn: {
    marginTop: 4,
  },
});
