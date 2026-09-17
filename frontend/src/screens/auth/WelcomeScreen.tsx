import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme, shadows } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { ParticleCanvas } from '@/components/effects/ParticleCanvas';
import { useAuthStore } from '@/stores/authStore';
import { haptics } from '@/theme/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { toggleDemoAuth } = useAuthStore();

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background }]}>
      <AuroraBackground emotion="joy" />
      <ParticleCanvas count={15} />

      <ScreenWrapper style={styles.container}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View
              style={[
                styles.orb,
                { backgroundColor: colors.glass.surface, borderColor: colors.glass.borderGlow },
                shadows.neonPulse(colors.primary),
              ]}
            >
              <Typography variant="display">🌌</Typography>
            </View>
            <Typography variant="display" weight="heavy" align="center" style={[styles.title, { color: colors.textPrimary }]}>
              MoodSpace
            </Typography>
            <Typography
              variant="bodyLarge"
              color={colors.textSecondary}
              align="center"
              style={styles.subtitle}
            >
              A living space to share how you feel, track your inner world, and discover nearby souls.
            </Typography>
          </View>

          <View style={styles.actionsSection}>
            <Button
              title="Create Account"
              variant="aurora"
              fullWidth
              size="lg"
              onPress={() => {
                navigation.navigate('Register');
                haptics.selection();
              }}
              style={styles.primaryBtn}
            />
            <Button
              title="I Already Have an Account"
              variant="glass"
              fullWidth
              size="md"
              onPress={() => {
                navigation.navigate('Login');
                haptics.selection();
              }}
              style={styles.secondaryBtn}
            />
            <Button
              title="Explore as Guest (No Sign-Up Needed)"
              variant="ghost"
              fullWidth
              size="sm"
              onPress={() => {
                toggleDemoAuth();
                haptics.selection();
              }}
              style={styles.demoBtn}
            />
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 24,
  },
  heroSection: {
    alignItems: 'center',
    marginTop: 48,
  },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    maxWidth: 320,
    lineHeight: 24,
  },
  actionsSection: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    marginBottom: 4,
  },
  secondaryBtn: {},
  demoBtn: {
    marginTop: 4,
  },
});
