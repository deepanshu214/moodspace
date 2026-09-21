import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  withSpring,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { AuthStackParamList } from '@/navigation/types';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Tactile } from '@/components/common/Tactile';
import { MoodSpaceLogo } from '@/components/common/MoodSpaceLogo';
import { MoodGlyph } from '@/components/mood/MoodGlyph';
import { getEmotionConfig, inkOnPastel } from '@/theme/colors';
import { useAuthStore } from '@/stores/authStore';
import { useAtmosphericPulse } from '@/hooks/useMap';
import { haptics } from '@/theme/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const DIAL = [
  { mood: 'joy', label: 'Joy', hz: '528 Hz • Solfeggio', quote: '“SF feels: golden sunlight on crisp concrete”' },
  { mood: 'calm', label: 'Calm', hz: '432 Hz • Ocean Delta', quote: '“Kyoto feels: mist drifting through bamboo”' },
  { mood: 'excitement', label: 'Hype', hz: '639 Hz • Electric Pulse', quote: '“Tokyo feels: midnight neon after the rain”' },
  { mood: 'sadness', label: 'Rain', hz: '396 Hz • Warm Rain', quote: '“London feels: warm coffee & old bookstore pages”' },
] as const;

const VALUES = [
  { label: 'Zero algorithmic cages', dot: '#FF5C38' },
  { label: '24h dissolve mist', dot: '#00A874' },
  { label: 'Real human resonance', dot: '#F59E0B' },
];

/** One expanding radar ripple; three staggered copies make the echo chamber. */
const RadarRing: React.FC<{ delay: number; color: string; dashed?: boolean; active: boolean }> = ({
  delay,
  color,
  dashed,
  active,
}) => {
  const t = useSharedValue(0);
  useEffect(() => {
    if (!active) {
      cancelAnimation(t);
      t.value = withTiming(0, { duration: 300 });
      return;
    }
    t.value = withDelay(delay, withRepeat(withTiming(1, { duration: 2400, easing: Easing.out(Easing.quad) }), -1, false));
  }, [active]);
  const style = useAnimatedStyle(() => ({
    opacity: active ? 0.9 * (1 - t.value) : 0.35,
    transform: [{ scale: 0.82 + 0.5 * t.value }],
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.ring, { borderColor: color, borderStyle: dashed ? 'dashed' : 'solid' }, style]}
    />
  );
};


/**
 * One spark thrown out of the radar when it echoes. Stitch spawns emoji
 * sparkles; the design system has no emoji, so these are mood-tinted marks.
 */
const RadarSpark: React.FC<{ burst: number; index: number; color: string }> = ({ burst, index, color }) => {
  const t = useSharedValue(0);

  // A fixed angle/distance per index keeps each burst visually consistent.
  const angle = (index / 5) * Math.PI * 2 + index * 0.7;
  const distance = 52 + (index % 3) * 18;

  useEffect(() => {
    if (!burst) return;
    t.value = 0;
    t.value = withTiming(1, { duration: 720, easing: Easing.out(Easing.quad) });
  }, [burst]);

  const style = useAnimatedStyle(() => ({
    opacity: burst ? 1 - t.value : 0,
    transform: [
      { translateX: Math.cos(angle) * distance * t.value },
      { translateY: Math.sin(angle) * distance * t.value - 20 * t.value },
      { scale: 0.6 + 0.7 * t.value },
      { rotate: `${(index % 2 === 0 ? 1 : -1) * 30 * t.value}deg` },
    ],
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.spark, { backgroundColor: color }, style]} />
  );
};

const PingDot: React.FC = () => {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }), -1, false);
  }, []);
  const halo = useAnimatedStyle(() => ({ opacity: 0.75 * (1 - p.value), transform: [{ scale: 1 + 1.4 * p.value }] }));
  return (
    <View style={styles.pingWrap}>
      <Animated.View style={[styles.pingHalo, halo]} />
      <View style={styles.pingDot} />
    </View>
  );
};

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { toggleDemoAuth } = useAuthStore();
  const { data: pulse } = useAtmosphericPulse();
  const [dialIndex, setDialIndex] = useState(0);
  // Bumped on every radar echo so the rings restart and sparks re-fire.
  const [echoBurst, setEchoBurst] = useState(0);
  const glowPulse = useSharedValue(1);
  const [echoOn, setEchoOn] = useState(true);

  const tuned = DIAL[dialIndex];
  const tunedConfig = getEmotionConfig(tuned.mood);

  /**
   * Tapping the mark sends a resonance echo, exactly as the Stitch prototype
   * does: the rings restart in the tuned mood's colour, the ambient glow
   * swells, and sparks scatter. Tuning the dial fires the same echo.
   */
  const triggerRadarEcho = useCallback(() => {
    haptics.medium();
    setEchoBurst((n) => n + 1);
    glowPulse.value = withSequence(
      withTiming(1.18, { duration: 220, easing: Easing.out(Easing.quad) }),
      withSpring(1, { damping: 12, stiffness: 160 })
    );
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: glowPulse.value }] }));
  const liveCount = pulse?.active_bubbles_count;

  return (
    <ScreenWrapper style={styles.container}>
      {/* ── Top bar: live pulse + echo toggle ── */}
      <View style={styles.topBar}>
        <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.glass.borderLight }]}>
          <PingDot />
          <Typography variant="caption" weight="heavy" style={{ color: colors.textPrimary }}>
            {liveCount ? `${liveCount.toLocaleString()} pulsing now` : 'Live now'}
          </Typography>
        </View>
        <Pressable
          onPress={() => {
            setEchoOn((v) => !v);
            haptics.selection();
          }}
          accessibilityRole="switch"
          accessibilityState={{ checked: echoOn }}
          accessibilityLabel="Toggle radar echo"
          style={[styles.pill, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glass.borderLight }]}
        >
          <Ionicons name="pulse" size={14} color={echoOn ? colors.primary : colors.textMuted} />
          <Typography variant="caption" weight="bold" style={{ color: colors.textPrimary }}>
            {echoOn ? 'Echo 432Hz' : 'Echo off'}
          </Typography>
        </Pressable>
      </View>

      {/* ── Hero: logo inside the resonance radar ── */}
      <View style={styles.hero}>
        <View style={styles.radar}>
          <Animated.View style={[StyleSheet.absoluteFill, glowStyle]} pointerEvents="none">
          <Svg width={300} height={300} style={StyleSheet.absoluteFill} pointerEvents="none">
            <Defs>
              <RadialGradient id="welcomeGlow" cx="50%" cy="50%" r="50%">
                <Stop offset="0" stopColor={tunedConfig.primary} stopOpacity={isDark ? 0.34 : 0.28} />
                <Stop offset="1" stopColor={tunedConfig.primary} stopOpacity={0} />
              </RadialGradient>
            </Defs>
            <Circle cx={150} cy={150} r={150} fill="url(#welcomeGlow)" />
          </Svg>
          </Animated.View>
          <RadarRing key={`r1-${echoBurst}`} delay={0} color={tunedConfig.primary} active={echoOn} />
          <RadarRing key={`r2-${echoBurst}`} delay={800} color={tunedConfig.primary} active={echoOn} />
          <RadarRing key={`r3-${echoBurst}`} delay={1600} color={tunedConfig.primary} dashed active={echoOn} />
          <View style={[styles.orbitDashed, { borderColor: colors.glass.borderLight }]} pointerEvents="none" />

          <Tactile offset={2} radius={999} style={styles.radarBadge} contentStyle={styles.radarBadgeInner} borderWidth={1.5}>
            <View style={styles.badgeDot} />
            <Typography variant="overline" style={{ color: colors.textPrimary, letterSpacing: 1 }}>
              Resonance Radar
            </Typography>
          </Tactile>

          {/* The brand tile stays white in both modes so the mark's ink outline reads. */}
          <Tactile
            offset={6}
            radius={28}
            backgroundColor="#FFFFFF"
            contentStyle={styles.logoTile}
            onPress={triggerRadarEcho}
            accessibilityLabel={`Send a ${tuned.label} resonance echo`}
          >
            <MoodSpaceLogo size={88} showBackground={false} animated />
          </Tactile>

          <View style={styles.sparkField} pointerEvents="none">
            {[0, 1, 2, 3, 4].map((i) => (
              <RadarSpark key={i} burst={echoBurst} index={i} color={tunedConfig.primary} />
            ))}
          </View>
        </View>

        <Typography variant="display" align="center" style={{ color: colors.textPrimary, marginTop: 6 }}>
          MoodSpace
        </Typography>
        <Typography variant="bodySmall" weight="medium" align="center" style={[styles.tagline, { color: colors.textSecondary }]}>
          Drop your feelings on the living map. Connect without performance.
        </Typography>

        {/* Live vibe quote — follows the dial */}
        <View style={[styles.quote, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glass.borderLight }]}>
          <MoodGlyph mood={tuned.mood} size={16} color={isDark ? tunedConfig.primary : tunedConfig.deep} />
          <Typography variant="bodySmall" weight="medium" style={{ color: colors.textPrimary, fontStyle: 'italic', flexShrink: 1 }}>
            {tuned.quote}
          </Typography>
        </View>

        {/* Live frequency dial */}
        <View style={styles.dialBlock}>
          <View style={styles.dialHeader}>
            <Typography variant="overline" style={{ color: colors.textSecondary, letterSpacing: 1 }}>
              Live Frequency Dial
            </Typography>
            <Typography variant="caption" weight="medium" style={{ color: colors.textMuted }}>
              {tuned.hz}
            </Typography>
          </View>
          <View style={[styles.dial, { backgroundColor: colors.backgroundSecondary, borderColor: colors.glass.borderLight }]}>
            {DIAL.map((d, i) => {
              const active = i === dialIndex;
              const cfg = getEmotionConfig(d.mood);
              return (
                <Pressable
                  key={d.mood}
                  onPress={() => {
                    setDialIndex(i);
                    triggerRadarEcho();
                    haptics.selection();
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={`Tune to ${d.label}`}
                  style={[styles.dialCell, active && { backgroundColor: colors.textPrimary }]}
                >
                  <MoodGlyph
                    mood={d.mood}
                    size={18}
                    color={active ? cfg.primary : isDark ? cfg.primary : cfg.deep}
                  />
                  <Typography
                    variant="caption"
                    weight="heavy"
                    style={{ color: active ? colors.background : colors.textPrimary, marginTop: 2 }}
                  >
                    {d.label}
                  </Typography>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.values}>
          {VALUES.map((v) => (
            <View key={v.label} style={[styles.valuePill, { backgroundColor: colors.surface, borderColor: colors.glass.borderLight }]}>
              <View style={[styles.valueDot, { backgroundColor: v.dot }]} />
              <Typography variant="caption" weight="medium" style={{ color: colors.textPrimary }}>
                {v.label}
              </Typography>
            </View>
          ))}
        </View>
      </View>

      {/* ── Action stack ── */}
      <View style={styles.actions}>
        <Tactile
          offset={4}
          radius={16}
          backgroundColor={colors.primary}
          contentStyle={styles.primaryBtn}
          onPress={() => {
            haptics.selection();
            navigation.navigate('Register');
          }}
          accessibilityLabel="Begin your journey"
        >
          <Typography variant="h4" style={{ color: inkOnPastel }}>
            Begin your journey
          </Typography>
          <Ionicons name="arrow-forward" size={20} color={inkOnPastel} />
        </Tactile>

        <View style={styles.secondaryRow}>
          <Tactile
            offset={2}
            radius={14}
            style={styles.flex1}
            contentStyle={styles.secondaryBtn}
            disabled
            accessibilityLabel="Sign in with Apple, coming soon"
          >
            {/* Dim only the contents: a translucent surface would let the ink shadow bleed through. */}
            <View style={[styles.secondaryInner, { opacity: 0.5 }]}>
              <Ionicons name="logo-apple" size={16} color={colors.textPrimary} />
              <Typography variant="label" style={{ color: colors.textPrimary }}>
                Apple ID
              </Typography>
            </View>
            <View style={[styles.soon, { backgroundColor: colors.secondary }]}>
              <Typography variant="overline" style={{ color: inkOnPastel, fontSize: 8 }}>
                Soon
              </Typography>
            </View>
          </Tactile>
          <Tactile
            offset={2}
            radius={14}
            style={styles.flex1}
            contentStyle={styles.secondaryBtn}
            onPress={() => {
              haptics.selection();
              navigation.navigate('Login');
            }}
            accessibilityLabel="Sign in with email"
          >
            <Ionicons name="mail-outline" size={16} color={colors.textPrimary} />
            <Typography variant="label" style={{ color: colors.textPrimary }}>
              Sign In / Email
            </Typography>
          </Tactile>
        </View>

        <Pressable
          onPress={() => {
            haptics.selection();
            toggleDemoAuth();
          }}
          accessibilityRole="button"
          style={styles.guestLink}
        >
          <Typography
            variant="label"
            style={[styles.guestText, { color: colors.textSecondary, textDecorationColor: colors.textSecondary }]}
          >
            Explore live map as quiet guest
          </Typography>
          <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, justifyContent: 'space-between' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  pingWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  pingHalo: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: '#34D399' },
  pingDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00A874' },
  hero: { alignItems: 'center', flexShrink: 1 },
  radar: { width: 300, height: 250, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', width: 192, height: 192, borderRadius: 96, borderWidth: 2 },
  orbitDashed: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  radarBadge: { position: 'absolute', top: 6, zIndex: 3 },
  radarBadgeInner: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF5C38' },
  spark: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  sparkField: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTile: { width: 112, height: 112, alignItems: 'center', justifyContent: 'center' },
  tagline: { maxWidth: 300, marginTop: 6 },
  quote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxWidth: 340,
  },
  dialBlock: { width: '100%', maxWidth: 340, marginTop: 14 },
  dialHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 4, marginBottom: 6 },
  dial: { flexDirection: 'row', gap: 6, padding: 4, borderRadius: 16, borderWidth: 1 },
  dialCell: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 12, minHeight: 44, justifyContent: 'center' },
  values: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 12, maxWidth: 340 },
  valuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  valueDot: { width: 6, height: 6, borderRadius: 3 },
  actions: { gap: 10, paddingBottom: 6 },
  primaryBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryRow: { flexDirection: 'row', gap: 8 },
  flex1: { flex: 1 },
  secondaryBtn: {
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  secondaryInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  soon: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  guestLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, minHeight: 44 },
  guestText: { textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
});
