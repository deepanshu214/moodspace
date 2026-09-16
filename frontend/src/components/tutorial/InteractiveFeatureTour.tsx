import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Platform,
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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, theme, springs, shadows } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
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
  spotlightArea: {
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    height: number;
    borderRadius: number;
  };
  tooltipPosition: 'top' | 'bottom' | 'center';
  tooltipOffsetTop?: number;
  tooltipOffsetBottom?: number;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'map',
    stepNumber: 1,
    totalSteps: 5,
    title: 'Live Mood Map',
    badge: 'Step 1 of 5 • Real-Time',
    emoji: '🗺️',
    color: '#00CEC9',
    description:
      'Explore live mood bubbles from people around you and worldwide. Tap any bubble on the map to read their thoughts and see the atmosphere.',
    spotlightArea: {
      top: Platform.OS === 'ios' ? 70 : 50,
      left: 16,
      width: SCREEN_WIDTH - 32,
      height: SCREEN_HEIGHT * 0.32,
      borderRadius: 24,
    },
    tooltipPosition: 'top',
    tooltipOffsetTop: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.42 : SCREEN_HEIGHT * 0.38,
  },
  {
    id: 'checkin',
    stepNumber: 2,
    totalSteps: 5,
    title: 'Check In Anytime (+)',
    badge: 'Step 2 of 5 • Share Mood',
    emoji: '✨',
    color: '#6C5CE7',
    description:
      'Tap the center (+) button at the bottom to drop your mood bubble. Pick your feeling, adjust the intensity from 1 to 10, or post incognito.',
    spotlightArea: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH / 2 - 34,
      width: 68,
      height: 68,
      borderRadius: 34,
    },
    tooltipPosition: 'bottom',
    tooltipOffsetBottom: Platform.OS === 'ios' ? 115 : 100,
  },
  {
    id: 'pulse',
    stepNumber: 3,
    totalSteps: 5,
    title: 'Mood Pulse & Trends',
    badge: 'Step 3 of 5 • Community',
    emoji: '🌊',
    color: '#FFB800',
    description:
      'See live emotion trends across the community. Tap any emotion pill or bar to instantly filter the feed and map to that vibe.',
    spotlightArea: {
      top: SCREEN_HEIGHT * 0.44,
      left: 16,
      width: SCREEN_WIDTH - 32,
      height: 120,
      borderRadius: 20,
    },
    tooltipPosition: 'top',
    tooltipOffsetTop: SCREEN_HEIGHT * 0.44 + 135,
  },
  {
    id: 'echoes',
    stepNumber: 4,
    totalSteps: 5,
    title: 'Echoes & Connections',
    badge: 'Step 4 of 5 • Connect',
    emoji: '💬',
    color: '#FD79A8',
    description:
      'Discover people on the same emotional frequency. Connect with gentle souls, share thoughts, and chat in safe, respectful spaces.',
    spotlightArea: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.58,
      width: 72,
      height: 56,
      borderRadius: 20,
    },
    tooltipPosition: 'bottom',
    tooltipOffsetBottom: Platform.OS === 'ios' ? 110 : 95,
  },
  {
    id: 'aura',
    stepNumber: 5,
    totalSteps: 5,
    title: 'Your Aura & Streak',
    badge: 'Step 5 of 5 • Mindful Habit',
    emoji: '🔥',
    color: '#00B894',
    description:
      'Check in daily to build your reflection streak, unlock mindfulness milestone badges, and watch your Aura score grow.',
    spotlightArea: {
      bottom: Platform.OS === 'ios' ? 24 : 14,
      left: SCREEN_WIDTH * 0.76,
      width: 72,
      height: 56,
      borderRadius: 20,
    },
    tooltipPosition: 'bottom',
    tooltipOffsetBottom: Platform.OS === 'ios' ? 110 : 95,
  },
];

export const InteractiveFeatureTour: React.FC<InteractiveFeatureTourProps> = ({
  visible,
  onClose,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

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
    haptics.success();
    try {
      await storage.setItem('hasCompletedInteractiveTour_v2', 'true');
    } catch {}
    onClose();
    setCurrentStepIndex(0);
  };

  const spotlightAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleComplete}>
      <View style={styles.overlay}>
        {/* Semi-transparent Dimmed Backdrop */}
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

        {/* ── Spotlight Target Highlight Ring ── */}
        <Animated.View
          style={[
            styles.spotlightBox,
            {
              top: step.spotlightArea.top,
              bottom: step.spotlightArea.bottom,
              left: step.spotlightArea.left,
              width: step.spotlightArea.width,
              height: step.spotlightArea.height,
              borderRadius: step.spotlightArea.borderRadius,
              borderColor: step.color,
              shadowColor: step.color,
            },
            spotlightAnimatedStyle,
          ]}
        >
          {/* Inner radial gradient ring */}
          <View
            style={[
              styles.spotlightRing,
              {
                borderRadius: step.spotlightArea.borderRadius,
                borderColor: 'rgba(255, 255, 255, 0.4)',
              },
            ]}
          />
        </Animated.View>

        {/* ── Tooltip Guidance Card ── */}
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.tooltipCard,
            step.tooltipPosition === 'top' && { top: step.tooltipOffsetTop },
            step.tooltipPosition === 'bottom' && { bottom: step.tooltipOffsetBottom },
          ]}
        >
          <BlurView intensity={50} tint="dark" style={styles.tooltipBlur}>
            <View style={styles.tooltipContent}>
              {/* Header: Step Badge & Skip Button */}
              <View style={styles.cardHeader}>
                <View style={[styles.badgePill, { backgroundColor: `${step.color}22`, borderColor: `${step.color}55` }]}>
                  <Typography variant="caption" weight="bold" style={{ color: step.color, fontSize: 11 }}>
                    {step.badge}
                  </Typography>
                </View>

                <TouchableOpacity onPress={handleComplete} style={styles.skipButton} activeOpacity={0.7}>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>
                    Skip Tour ✕
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

              {/* Progress Dots */}
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
                  <View style={{ width: 70 }} />
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
    backgroundColor: 'rgba(5, 7, 14, 0.82)',
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
  spotlightRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    opacity: 0.7,
  },
  tooltipCard: {
    position: 'absolute',
    left: 20,
    right: 20,
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
    padding: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeDot: {
    height: 6,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  nextButton: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
});
