import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { ParticleCanvas } from '@/components/effects/ParticleCanvas';
import { MoodSpaceLogo } from '@/components/common/MoodSpaceLogo';
import { useAuthStore } from '@/stores/authStore';
import { haptics } from '@/theme/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const EMOTION_PREVIEW = [
  { emoji: '☀️', label: 'Joy', color: '#FF9F1C' },
  { emoji: '🌿', label: 'Calm', color: '#00B4A6' },
  { emoji: '💖', label: 'Love', color: '#FF4D84' },
  { emoji: '⚡', label: 'Excited', color: '#C471ED' },
];

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { toggleDemoAuth } = useAuthStore();

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background }]}>
      <AuroraBackground emotion="joy" />
      <ParticleCanvas count={22} />

      <ScreenWrapper style={styles.container} backgroundColor="transparent">
        {/* ── Hero ── */}
        <View style={styles.heroSection}>
          <MoodSpaceLogo size={120} showBackground animated={Platform.OS !== 'web'} />

          <Typography
            variant="display"
            weight="heavy"
            align="center"
            style={[styles.title, { color: colors.textPrimary }]}
          >
            MoodSpace
          </Typography>

          <Typography
            variant="bodyLarge"
            align="center"
            style={[styles.tagline, { color: colors.textSecondary }]}
          >
            Drop your mood on the map.{'\n'}Feel the world pulse back.
          </Typography>

          {/* Emotion preview chips */}
          <View style={styles.moodChipsRow}>
            {EMOTION_PREVIEW.map((em) => (
              <View
                key={em.label}
                style={[
                  styles.moodChip,
                  { backgroundColor: em.color + '22', borderColor: em.color + '55' },
                ]}
              >
                <Typography style={{ fontSize: 14 }}>{em.emoji}</Typography>
                <Typography
                  variant="caption"
                  weight="semibold"
                  style={{ color: em.color, marginLeft: 4 }}
                >
                  {em.label}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {/* ── CTA Card ── */}
        <View
          style={[
            styles.ctaCard,
            { backgroundColor: colors.glass.surface, borderColor: colors.glass.borderGlow },
          ]}
        >
          <Button
            title="Begin Your Journey"
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
            title="Welcome Back"
            variant="glass"
            fullWidth
            size="md"
            onPress={() => {
              navigation.navigate('Login');
              haptics.selection();
            }}
          />
          <View style={[styles.dividerRow, { borderTopColor: colors.glass.border }]}>
            <Typography variant="caption" align="center" style={{ color: colors.textMuted }}>
              No account? No problem.
            </Typography>
          </View>
          <Button
            title="Explore as Guest"
            variant="ghost"
            fullWidth
            size="sm"
            onPress={() => {
              toggleDemoAuth();
              haptics.selection();
            }}
          />
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
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  heroSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    marginTop: 20,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  tagline: {
    lineHeight: 26,
    maxWidth: 280,
    textAlign: 'center',
    marginBottom: 24,
  },
  moodChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  ctaCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 10,
    marginBottom: 20,
  },
  primaryBtn: {},
  dividerRow: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
});
