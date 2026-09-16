import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme, shadows } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ReactionFloater } from '@/components/mood/ReactionFloater';
import { haptics } from '@/theme/haptics';
import { storage } from '@/utils/storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface InteractiveFeatureTourProps {
  visible: boolean;
  onClose: () => void;
  onNavigateTab?: (tabName: string) => void;
}

interface TourStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  badge: string;
  emoji: string;
  color: string;
  description: string;
  dockPosition: 'top' | 'bottom'; // Top docked if target is bottom; bottom docked if target is top
  spotlightTarget: {
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    height: number;
    borderRadius: number;
  };
  demoType: 'map' | 'emotion' | 'pulse' | 'reaction' | 'circle' | 'chat' | 'streak';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'map',
    stepNumber: 1,
    totalSteps: 7,
    title: 'World Mood Map',
    badge: 'Step 1 of 7 • Explore',
    emoji: '🗺️',
    color: '#00CEC9',
    description:
      'Explore live mood bubbles from people around you and worldwide. Pinch or tap +/− to zoom, tap any bubble to read their reflection.',
    dockPosition: 'bottom',
    spotlightTarget: {
      top: Platform.OS === 'ios' ? 70 : 50,
      left: 16,
      width: SCREEN_WIDTH - 32,
      height: SCREEN_HEIGHT * 0.30,
      borderRadius: 24,
    },
    demoType: 'map',
  },
  {
    id: 'checkin',
    stepNumber: 2,
    totalSteps: 7,
    title: 'Check In Anytime (+)',
    badge: 'Step 2 of 7 • Express',
    emoji: '✨',
    color: '#6C5CE7',
    description:
      'Tap the center (+) button anytime to drop your mood bubble. Pick how you feel, set the intensity from 1 to 10, or post incognito.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH / 2 - 34,
      width: 68,
      height: 68,
      borderRadius: 34,
    },
    demoType: 'emotion',
  },
  {
    id: 'pulse',
    stepNumber: 3,
    totalSteps: 7,
    title: 'Live Mood Pulse & Waves',
    badge: 'Step 3 of 7 • Atmosphere',
    emoji: '🌊',
    color: '#FFB800',
    description:
      'See community mood distribution in real time. Tap any emotion pill to instantly filter the feed and map to that emotional vibe.',
    dockPosition: 'bottom',
    spotlightTarget: {
      top: SCREEN_HEIGHT * 0.42,
      left: 16,
      width: SCREEN_WIDTH - 32,
      height: 100,
      borderRadius: 20,
    },
    demoType: 'pulse',
  },
  {
    id: 'reactions',
    stepNumber: 4,
    totalSteps: 7,
    title: 'Echoes & Warm Reactions',
    badge: 'Step 4 of 7 • Empathy',
    emoji: '💖',
    color: '#FD79A8',
    description:
      'Read honest reflections and send support. Tap Support ❤️, Gentle Hug 🤗, With You 🌊, or Celebrate ✨ to share instant warmth.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.32,
      width: 64,
      height: 56,
      borderRadius: 20,
    },
    demoType: 'reaction',
  },
  {
    id: 'circles',
    stepNumber: 5,
    totalSteps: 7,
    title: 'Community Circles',
    badge: 'Step 5 of 7 • Safe Spaces',
    emoji: '🌱',
    color: '#00B894',
    description:
      'Join dedicated circles like Mindful Morning, Ocean Walks, or Late Night Reflections with people going through similar life moments.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.58,
      width: 64,
      height: 56,
      borderRadius: 20,
    },
    demoType: 'circle',
  },
  {
    id: 'chats',
    stepNumber: 6,
    totalSteps: 7,
    title: '1-on-1 Gentle Chats',
    badge: 'Step 6 of 7 • Kindred Spirits',
    emoji: '🕊️',
    color: '#A29BFE',
    description:
      'Privately connect with someone on your emotional wavelength. Share comfort with icebreaker prompts in safe, respectful chats.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.58,
      width: 64,
      height: 56,
      borderRadius: 20,
    },
    demoType: 'chat',
  },
  {
    id: 'streak',
    stepNumber: 7,
    totalSteps: 7,
    title: 'Daily Streak & Constellation',
    badge: 'Step 7 of 7 • Mindful Rhythm',
    emoji: '🔥',
    color: '#FF7675',
    description:
      'Build a daily check-in habit, watch your monthly mood constellation fill with color, and grow your Aura score with mindful consistency.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.80,
      width: 60,
      height: 56,
      borderRadius: 20,
    },
    demoType: 'streak',
  },
];

export const InteractiveFeatureTour: React.FC<InteractiveFeatureTourProps> = ({
  visible,
  onClose,
  onNavigateTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Interactive Demo Sandbox States
  const [demoSelectedEmotion, setDemoSelectedEmotion] = useState('calm');
  const [demoFloaterKey, setDemoFloaterKey] = useState(0);
  const [demoFloaterEmoji, setDemoFloaterEmoji] = useState('❤️');
  const [demoJoinedCircle, setDemoJoinedCircle] = useState(false);
  const [demoStreakCount, setDemoStreakCount] = useState(7);
  const [demoMessageSent, setDemoMessageSent] = useState(false);
  const [demoBubbleTapped, setDemoBubbleTapped] = useState(false);

  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
      pulseAnim.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    }
  }, [visible]);

  if (!visible) return null;

  const step = TOUR_STEPS[currentStepIndex];
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    haptics.selection();
    if (isLast) {
      handleComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    haptics.light();
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    haptics.medium();
    try {
      await storage.setItem('hasCompletedInteractiveTour_v2', 'true');
    } catch {}
    onClose();
  };

  const animatedSpotlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const spotlightPositionStyle = {
    top: step.spotlightTarget.top,
    bottom: step.spotlightTarget.bottom,
    left: step.spotlightTarget.left,
    width: step.spotlightTarget.width,
    height: step.spotlightTarget.height,
    borderRadius: step.spotlightTarget.borderRadius,
  };

  // Render Interactive Sandbox based on current feature demoType
  const renderInteractiveDemo = () => {
    switch (step.demoType) {
      case 'map':
        return (
          <View style={styles.demoCard}>
            <Typography variant="overline" color={colors.textMuted} style={{ marginBottom: 6 }}>
              INTERACTIVE DEMO: TAP THE MOOD BUBBLE
            </Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setDemoBubbleTapped(!demoBubbleTapped);
                haptics.light();
              }}
              style={[
                styles.demoBubblePill,
                demoBubbleTapped && { borderColor: '#00CEC9', backgroundColor: 'rgba(0, 206, 201, 0.2)' },
              ]}
            >
              <Typography style={{ fontSize: 18 }}>🌊</Typography>
              <Typography variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 6 }}>
                Tokyo • Peaceful Morning
              </Typography>
            </TouchableOpacity>
            {demoBubbleTapped && (
              <Typography variant="caption" color={colors.primaryLight} style={{ marginTop: 6, fontStyle: 'italic' }}>
                "Listening to gentle raindrops against the window with hot tea."
              </Typography>
            )}
          </View>
        );

      case 'emotion':
        return (
          <View style={styles.demoCard}>
            <Typography variant="overline" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY IT: PICK YOUR FEELING
            </Typography>
            <View style={styles.demoRow}>
              {[
                { name: 'calm', label: 'Calm', emoji: '🌿', color: '#00CEC9' },
                { name: 'joy', label: 'Joy', emoji: '☀️', color: '#FFB800' },
                { name: 'love', label: 'Love', emoji: '💖', color: '#FF6B81' },
              ].map((em) => {
                const active = demoSelectedEmotion === em.name;
                return (
                  <TouchableOpacity
                    key={em.name}
                    activeOpacity={0.7}
                    onPress={() => {
                      setDemoSelectedEmotion(em.name);
                      haptics.selection();
                    }}
                    style={[
                      styles.demoPill,
                      active && { borderColor: em.color, backgroundColor: `${em.color}25` },
                    ]}
                  >
                    <Typography style={{ fontSize: 16 }}>{em.emoji}</Typography>
                    <Typography variant="caption" weight="bold" color={active ? em.color : colors.textSecondary} style={{ marginLeft: 4 }}>
                      {em.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'pulse':
        return (
          <View style={styles.demoCard}>
            <Typography variant="overline" color={colors.textMuted} style={{ marginBottom: 6 }}>
              LIVE ATMOSPHERE BREAKDOWN
            </Typography>
            <View style={styles.demoPulseRow}>
              <View style={[styles.demoPulseBar, { flex: 4, backgroundColor: '#00CEC9' }]} />
              <View style={[styles.demoPulseBar, { flex: 3, backgroundColor: '#FFB800' }]} />
              <View style={[styles.demoPulseBar, { flex: 2, backgroundColor: '#9C27B0' }]} />
              <View style={[styles.demoPulseBar, { flex: 1, backgroundColor: '#4A90E2' }]} />
            </View>
            <Typography variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
              40% Calm 🌿 • 30% Joy ☀️ • 20% Reflective 💜 • 10% Soft 🌧️
            </Typography>
          </View>
        );

      case 'reaction':
        return (
          <View style={styles.demoCard}>
            <Typography variant="overline" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY SENDING A REACTION
            </Typography>
            <View style={styles.demoRow}>
              {[
                { emoji: '❤️', label: 'Support' },
                { emoji: '🤗', label: 'Hug' },
                { emoji: '🌊', label: 'With You' },
              ].map((rx) => (
                <TouchableOpacity
                  key={rx.label}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDemoFloaterEmoji(rx.emoji);
                    setDemoFloaterKey(Date.now());
                    haptics.medium();
                  }}
                  style={styles.demoPill}
                >
                  <ReactionFloater emoji={demoFloaterEmoji} triggerKey={demoFloaterKey} />
                  <Typography style={{ fontSize: 15 }}>{rx.emoji}</Typography>
                  <Typography variant="caption" weight="semibold" color={colors.textPrimary} style={{ marginLeft: 4 }}>
                    {rx.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'circle':
        return (
          <View style={styles.demoCard}>
            <View style={styles.circleDemoRow}>
              <Typography style={{ fontSize: 24 }}>🌱</Typography>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Typography variant="caption" weight="bold" color={colors.textPrimary}>
                  Ocean Walks & Stillness
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  482 kindred souls holding quiet space
                </Typography>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setDemoJoinedCircle(!demoJoinedCircle);
                  haptics.light();
                }}
                style={[
                  styles.joinBtn,
                  demoJoinedCircle && { backgroundColor: 'rgba(0, 184, 148, 0.2)', borderColor: '#00B894' },
                ]}
              >
                <Typography variant="caption" weight="bold" color={demoJoinedCircle ? '#00B894' : colors.primaryLight}>
                  {demoJoinedCircle ? 'Joined ✓' : 'Join'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'chat':
        return (
          <View style={styles.demoCard}>
            <Typography variant="overline" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY GENTLE ICEBREAKER
            </Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setDemoMessageSent(true);
                haptics.light();
              }}
              style={styles.icebreakerPill}
            >
              <Typography variant="caption" color={demoMessageSent ? colors.primaryLight : colors.textPrimary}>
                {demoMessageSent
                  ? 'Sent: "Sending you quiet comfort tonight 🕊️"'
                  : 'Tap to send: "Sending you quiet comfort tonight 🕊️"'}
              </Typography>
            </TouchableOpacity>
          </View>
        );

      case 'streak':
        return (
          <View style={styles.demoCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setDemoStreakCount((c) => c + 1);
                haptics.medium();
              }}
              style={styles.streakDemoRow}
            >
              <Typography style={{ fontSize: 26 }}>🔥</Typography>
              <View style={{ marginLeft: 10 }}>
                <Typography variant="body" weight="bold" color="#FF7675">
                  {demoStreakCount} Days of Presence!
                </Typography>
                <Typography variant="caption" color={colors.textMuted}>
                  Tap flame to celebrate mindful consistency
                </Typography>
              </View>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* ── Glowing Spotlight Ring Framing Target (Never Blocks Clicks) ── */}
        <Animated.View
          style={[
            styles.spotlightBox,
            {
              borderColor: step.color,
              shadowColor: step.color,
              borderRadius: step.spotlightTarget.borderRadius,
            },
            animatedSpotlightStyle,
            spotlightPositionStyle,
          ]}
        />

        {/* ── Guidance Tooltip Card (Smart Docked Away from Target) ── */}
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.tooltipCard,
            step.dockPosition === 'top'
              ? { top: Platform.OS === 'ios' ? 70 : 50 }
              : { bottom: Platform.OS === 'ios' ? 100 : 80 },
          ]}
        >
          <BlurView intensity={55} tint="dark" style={styles.tooltipBlur}>
            <View style={styles.tooltipContent}>
              {/* Header: Badge & Skip */}
              <View style={styles.cardHeader}>
                <View style={[styles.badgePill, { backgroundColor: `${step.color}22`, borderColor: `${step.color}55` }]}>
                  <Typography variant="caption" weight="bold" style={{ color: step.color, fontSize: 11 }}>
                    {step.badge}
                  </Typography>
                </View>

                <TouchableOpacity onPress={handleComplete} style={styles.skipButton} activeOpacity={0.7}>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>
                    Skip Guide ✕
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* Title with Emoji */}
              <View style={styles.titleRow}>
                <Typography style={{ fontSize: 22, marginRight: 8 }}>{step.emoji}</Typography>
                <Typography variant="h3" weight="bold" style={{ color: colors.textPrimary, flex: 1 }}>
                  {step.title}
                </Typography>
              </View>

              {/* Body Description */}
              <Typography variant="bodySmall" style={styles.descriptionText}>
                {step.description}
              </Typography>

              {/* Interactive Sandbox Demo */}
              {renderInteractiveDemo()}

              {/* Step Progress Dots */}
              <View style={styles.dotsRow}>
                {TOUR_STEPS.map((s, idx) => (
                  <View
                    key={s.id}
                    style={[
                      styles.dot,
                      idx === currentStepIndex && [styles.activeDot, { backgroundColor: step.color, width: 20 }],
                    ]}
                  />
                ))}
              </View>

              {/* Action Buttons: Back & Next */}
              <View style={styles.actionRow}>
                {currentStepIndex > 0 ? (
                  <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                    <Typography variant="label" weight="semibold" style={{ color: colors.textSecondary }}>
                      ← Back
                    </Typography>
                  </TouchableOpacity>
                ) : (
                  <View style={{ width: 65 }} />
                )}

                <TouchableOpacity
                  onPress={handleNext}
                  style={[styles.nextButton, { backgroundColor: step.color }]}
                  activeOpacity={0.8}
                >
                  <Typography variant="label" weight="bold" style={{ color: '#FFFFFF' }}>
                    {isLast ? 'Got it! Explore 🚀' : 'Next →'}
                  </Typography>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 14, 0.70)',
  },
  spotlightBox: {
    position: 'absolute',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 20,
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  tooltipCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    ...shadows.heavy,
  },
  tooltipBlur: {
    borderRadius: 24,
  },
  tooltipContent: {
    backgroundColor: 'rgba(18, 20, 32, 0.94)',
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipButton: {
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  descriptionText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  demoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  demoBubblePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  demoPulseRow: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 3,
  },
  demoPulseBar: {
    borderRadius: 4,
  },
  circleDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
  },
  icebreakerPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  streakDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 14,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    height: 6,
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  nextButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    ...shadows.soft,
  },
});
