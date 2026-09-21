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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme, shadows } from '@/theme';
// This tour tooltip is an intentionally always-dark glass card (like a spotlight
// overlay) regardless of the app's light/dark theme, so it always pulls text
// colors from the dark palette rather than the reactive theme.
import { darkColors as colors, inkOnPastel } from '@/theme/colors';
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
  dockPosition: 'top' | 'bottom';
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
    color: '#5CD694',
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
    color: '#FF5C38',
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
    color: '#FF5C38',
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
    color: '#F87171',
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
    color: '#5CD694',
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
    id: 'chat',
    stepNumber: 6,
    totalSteps: 7,
    title: '1-on-1 Gentle Chats',
    badge: 'Step 6 of 7 • Connect',
    emoji: '💬',
    color: '#C084FC',
    description:
      'Privately connect with someone who resonates with your feeling. Safe, gentle, anonymous-friendly conversation.',
    dockPosition: 'top',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.76,
      width: 58,
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
    badge: 'Step 7 of 7 • Reflection',
    emoji: '🔥',
    color: '#F87171',
    description:
      'Build your mindful check-in streak and view your entire month in soft organic mood pebbles and emotional colors on your Profile.',
    dockPosition: 'bottom',
    spotlightTarget: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.88,
      width: 58,
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

  useEffect(() => {
    if (visible) {
      setCurrentStepIndex(0);
    }
  }, [visible]);

  if (!visible) return null;

  const step = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
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

  // Render Interactive Sandbox based on current feature demoType
  const renderInteractiveDemo = () => {
    switch (step.demoType) {
      case 'map':
        return (
          <View style={styles.demoCard}>
            <Typography variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY IT: TAP THE MOOD BUBBLE
            </Typography>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setDemoBubbleTapped(!demoBubbleTapped);
                haptics.light();
              }}
              style={[
                styles.demoBubblePill,
                demoBubbleTapped && { borderColor: '#5CD694', backgroundColor: 'rgba(92, 214, 148, 0.2)' },
              ]}
            >
              <Typography style={{ fontSize: 18 }}>🌊</Typography>
              <Typography variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 6 }}>
                Tokyo • Peaceful Morning
              </Typography>
            </TouchableOpacity>
            {demoBubbleTapped && (
              <Typography variant="caption" color="#5CD694" style={{ marginTop: 6, fontStyle: 'italic' }}>
                ✓ Bubble opened: "Listening to the quiet city sounds as morning breaks."
              </Typography>
            )}
          </View>
        );

      case 'emotion':
        return (
          <View style={styles.demoCard}>
            <Typography variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY IT: PICK YOUR FEELING
            </Typography>
            <View style={styles.demoRow}>
              {[
                { emotion: 'joy', emoji: '☀️', label: 'Joy' },
                { emotion: 'calm', emoji: '🌿', label: 'Calm' },
                { emotion: 'love', emoji: '💖', label: 'Love' },
                { emotion: 'sadness', emoji: '💜', label: 'Deep' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.emotion}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDemoSelectedEmotion(item.emotion);
                    haptics.selection();
                  }}
                  style={[
                    styles.demoEmotionBtn,
                    demoSelectedEmotion === item.emotion && styles.demoEmotionBtnActive,
                  ]}
                >
                  <Typography style={{ fontSize: 18 }}>{item.emoji}</Typography>
                  <Typography variant="caption" color={colors.textPrimary} style={{ fontSize: 10, marginTop: 2 }}>
                    {item.label}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      case 'pulse':
        return (
          <View style={styles.demoCard}>
            <Typography variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
              ATMOSPHERE PULSE PREVIEW
            </Typography>
            <View style={styles.pulseBarContainer}>
              <View style={[styles.pulseSegment, { flex: 4, backgroundColor: '#5CD694' }]} />
              <View style={[styles.pulseSegment, { flex: 3, backgroundColor: '#FF5C38' }]} />
              <View style={[styles.pulseSegment, { flex: 2, backgroundColor: '#F87171' }]} />
              <View style={[styles.pulseSegment, { flex: 1, backgroundColor: '#C084FC' }]} />
            </View>
            <Typography variant="caption" color={colors.textSecondary} style={{ marginTop: 6, textAlign: 'center' }}>
              40% Calm 🌿 • 30% Joy ☀️ • 20% Love 💖
            </Typography>
          </View>
        );

      case 'reaction':
        return (
          <View style={styles.demoCard}>
            <Typography variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
              TRY IT: TAP TO SEND EMPATHY
            </Typography>
            <ReactionFloater emoji={demoFloaterEmoji} triggerKey={demoFloaterKey} />
            <View style={styles.demoRow}>
              {[
                { label: 'Support', emoji: '❤️' },
                { label: 'Hug', emoji: '🤗' },
                { label: 'With You', emoji: '🌊' },
                { label: 'Celebrate', emoji: '✨' },
              ].map((rx) => (
                <TouchableOpacity
                  key={rx.label}
                  activeOpacity={0.7}
                  onPress={() => {
                    setDemoFloaterEmoji(rx.emoji);
                    setDemoFloaterKey((k) => k + 1);
                    haptics.light();
                  }}
                  style={styles.demoRxPill}
                >
                  <Typography style={{ fontSize: 16 }}>{rx.emoji}</Typography>
                  <Typography variant="caption" color={colors.textPrimary} style={{ fontSize: 10, marginTop: 2 }}>
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
                  demoJoinedCircle && { backgroundColor: 'rgba(92, 214, 148, 0.2)', borderColor: '#5CD694' },
                ]}
              >
                <Typography variant="caption" weight="bold" color={demoJoinedCircle ? '#5CD694' : colors.primaryLight}>
                  {demoJoinedCircle ? 'Joined ✓' : 'Join'}
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'chat':
        return (
          <View style={styles.demoCard}>
            <Typography variant="caption" weight="bold" color={colors.textMuted} style={{ marginBottom: 6 }}>
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
                <Typography variant="body" weight="bold" color="#F87171">
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

  const ContainerBlur = Platform.OS === 'android' ? View : BlurView;
  const blurProps = Platform.OS === 'android'
    ? { style: styles.tooltipBlur }
    : { intensity: 70, tint: 'dark' as const, style: styles.tooltipBlur };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.centerContainer} pointerEvents="box-none">
          <View style={[styles.tooltipCard, { borderColor: step.color }]}>
            <ContainerBlur {...blurProps}>
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
                  <Typography style={{ fontSize: 24, marginRight: 8 }}>{step.emoji}</Typography>
                  <Typography variant="h3" weight="bold" style={{ color: colors.textPrimary, flex: 1 }}>
                    {step.title}
                  </Typography>
                </View>

                {/* Body Description */}
                <Typography variant="bodySmall" style={styles.descriptionText}>
                  {step.description}
                </Typography>

                {/* Interactive Sandbox Demo */}
                <ScrollView style={styles.demoScroll} showsVerticalScrollIndicator={false}>
                  {renderInteractiveDemo()}
                </ScrollView>

                {/* Step Progress Dots */}
                <View style={styles.dotsRow}>
                  {TOUR_STEPS.map((s, idx) => (
                    <View
                      key={s.id}
                      style={[
                        styles.dot,
                        idx === currentStepIndex && [styles.activeDot, { backgroundColor: step.color, width: 22 }],
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
                    <Typography variant="label" weight="bold" style={{ color: inkOnPastel }}>
                      {isLast ? 'Got it! Explore 🚀' : 'Next →'}
                    </Typography>
                  </TouchableOpacity>
                </View>
              </View>
            </ContainerBlur>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 19, 22, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 420,
  },
  tooltipCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    ...shadows.heavy,
  },
  tooltipBlur: {
    borderRadius: 24,
  },
  tooltipContent: {
    backgroundColor: 'rgba(28, 30, 36, 0.94)',
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  skipButton: {
    padding: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  demoScroll: {
    maxHeight: 180,
  },
  demoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  demoEmotionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  demoEmotionBtnActive: {
    borderColor: '#FF5C38',
    backgroundColor: 'rgba(255, 92, 56, 0.25)',
  },
  demoBubblePill: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  pulseBarContainer: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 4,
  },
  pulseSegment: {
    height: '100%',
  },
  demoRxPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  circleDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  icebreakerPill: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 92, 56, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 92, 56, 0.3)',
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
    marginVertical: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  nextButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
  },
});
