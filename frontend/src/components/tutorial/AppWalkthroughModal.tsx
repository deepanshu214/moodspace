import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

export interface AppWalkthroughModalProps {
  visible: boolean;
  onClose: () => void;
}

interface WalkthroughSlide {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  description: string;
  badgeText: string;
  color: string;
  iconName: keyof typeof Ionicons.glyphMap;
  features: string[];
}

const SLIDES: WalkthroughSlide[] = [
  {
    id: 'map',
    emoji: '🗺️',
    title: 'Live Mood Map',
    tagline: 'See how people feel around the world',
    description:
      'Explore live emotion bubbles placed on the map. Tap any bubble to read thoughts from people in your city or across the globe.',
    badgeText: 'Explore',
    color: '#00CEC9',
    iconName: 'map-outline',
    features: [
      'Interactive bubbles showing current feelings',
      'Filter by Joy, Calm, Anxiety, and more',
      'Real-time updates from worldwide cities',
    ],
  },
  {
    id: 'checkin',
    emoji: '✍️',
    title: 'Share Your Mood',
    tagline: 'Post what is on your mind in 10 seconds',
    description:
      'Tap the center (+) button anytime to drop a mood bubble. Pick how you feel, adjust the intensity, and add a quick thought.',
    badgeText: 'Check-In',
    color: '#6C5CE7',
    iconName: 'add-circle-outline',
    features: [
      'Choose from 6 core emotions with clear intensity',
      'Post with your name or stay 100% anonymous',
      'Share from any city across the world',
    ],
  },
  {
    id: 'circles',
    emoji: '👥',
    title: 'Community Circles',
    tagline: 'Join groups that matter to you',
    description:
      'Be part of communities centered around mindfulness, campus life, late-night thoughts, or creative hobbies.',
    badgeText: 'Communities',
    color: '#A29BFE',
    iconName: 'people-outline',
    features: [
      'See group mood summaries and discussions',
      'Join public circles or create private spaces',
      'Encourage members with friendly reactions',
    ],
  },
  {
    id: 'echoes',
    emoji: '🕊️',
    title: '1-on-1 Friendly Chats',
    tagline: 'Connect with someone feeling like you',
    description:
      'Feeling down, excited, or stressed? Match with someone who understands what you are going through and start a supportive conversation.',
    badgeText: 'Connections',
    color: '#FD79A8',
    iconName: 'chatbubbles-outline',
    features: [
      'Resonance matching based on similar feelings',
      'Warm icebreaker conversation starters',
      'Completely private, safe 1-on-1 messaging',
    ],
  },
  {
    id: 'profile',
    emoji: '🌟',
    title: 'Your Wellness Journey',
    tagline: 'Build streaks and watch yourself grow',
    description:
      'Track your emotional check-ins on a calendar heatmap, maintain your daily streak, and unlock wellness milestones.',
    badgeText: 'Wellness',
    color: '#FFD166',
    iconName: 'sparkles-outline',
    features: [
      'Daily mood streak tracker with fun milestones',
      'GitHub-style mood history calendar',
      'Full privacy controls and ghost mode anytime',
    ],
  },
];

export const AppWalkthroughModal: React.FC<AppWalkthroughModalProps> = ({
  visible,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!visible) return null;

  const currentSlide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    haptics.selection();
    if (isLast) {
      onClose();
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    haptics.selection();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSkip = () => {
    haptics.light();
    onClose();
    setCurrentIndex(0);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header Actions */}
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: `${currentSlide.color}22` }]}>
              <Ionicons name={currentSlide.iconName} size={14} color={currentSlide.color} />
              <Typography variant="caption" weight="bold" color={currentSlide.color} style={styles.badgeText}>
                {currentSlide.badgeText} • Step {currentIndex + 1} of {SLIDES.length}
              </Typography>
            </View>

            <TouchableOpacity
              onPress={handleSkip}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.skipBtn}
            >
              <Typography variant="bodySmall" color={theme.colors.textMuted} weight="medium">
                Skip
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Hero Visual */}
          <View style={styles.visualContainer}>
            <View style={[styles.glowCircle, { backgroundColor: `${currentSlide.color}18`, borderColor: `${currentSlide.color}44` }]}>
              <Typography variant="display" style={styles.emoji}>
                {currentSlide.emoji}
              </Typography>
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.body}>
            <Typography variant="h2" weight="bold" align="center" style={styles.title}>
              {currentSlide.title}
            </Typography>

            <Typography
              variant="bodySmall"
              color={currentSlide.color}
              weight="semibold"
              align="center"
              style={styles.tagline}
            >
              {currentSlide.tagline}
            </Typography>

            <Typography
              variant="body"
              color={theme.colors.textSecondary}
              align="center"
              style={styles.description}
            >
              {currentSlide.description}
            </Typography>

            {/* Feature Bullet Points */}
            <View style={styles.featureList}>
              {currentSlide.features.map((feat, idx) => (
                <View key={idx} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color={currentSlide.color} />
                  <Typography variant="bodySmall" color={theme.colors.textPrimary} style={styles.featureText}>
                    {feat}
                  </Typography>
                </View>
              ))}
            </View>
          </View>

          {/* Stepper Dots */}
          <View style={styles.dotsContainer}>
            {SLIDES.map((s, idx) => {
              const active = idx === currentIndex;
              return (
                <Pressable
                  key={s.id}
                  onPress={() => {
                    haptics.selection();
                    setCurrentIndex(idx);
                  }}
                  style={[
                    styles.dot,
                    active && {
                      backgroundColor: currentSlide.color,
                      width: 24,
                    },
                  ]}
                />
              );
            })}
          </View>

          {/* Navigation Controls */}
          <View style={styles.footer}>
            {currentIndex > 0 ? (
              <Button
                title="Back"
                variant="ghost"
                size="md"
                onPress={handleBack}
                style={styles.backBtn}
              />
            ) : (
              <View style={styles.backBtnPlaceholder} />
            )}

            <Button
              title={isLast ? 'Get Started 🎉' : 'Next →'}
              variant="primary"
              size="md"
              onPress={handleNext}
              style={[styles.nextBtn, isLast && { backgroundColor: theme.colors.primary }]}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 7, 15, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'rgba(20, 22, 35, 0.90)',
    borderRadius: 24,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 28,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
  },
  badgeText: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  skipBtn: {
    padding: 4,
  },
  visualContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  glowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 38,
  },
  body: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    marginBottom: 4,
  },
  tagline: {
    marginBottom: 8,
  },
  description: {
    lineHeight: 22,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  featureList: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    flex: 1,
    lineHeight: 18,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: theme.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  backBtn: {
    minWidth: 80,
  },
  backBtnPlaceholder: {
    minWidth: 80,
  },
  nextBtn: {
    flex: 1,
  },
});
