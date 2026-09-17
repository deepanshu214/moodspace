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
  { emoji: '☀️', label: 'Joy', color: '#FFE082', ink: '#B07D18' },
  { emoji: '🌿', label: 'Calm', color: '#A7D7C5', ink: '#3F8B72' },
  { emoji: '💖', label: 'Love', color: '#F8BBD0', ink: '#C2557E' },
  { emoji: '⚡', label: 'Excited', color: '#E1BEE7', ink: '#8E5C99' },
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
          <MoodSpaceLogo size={128} showBackground animated />

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
                  { backgroundColor: em.color, borderColor: em.ink + '44' },
                ]}
              >
                <Typography style={{ fontSize: 14 }}>{em.emoji}</Typography>
                <Typography
                  variant="caption"
                  weight="bold"
                  style={{ color: em.ink, marginLeft: 4 }}
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
