import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { MoodTag } from '@/components/mood/MoodTag';
import { Chip } from '@/components/common/Chip';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useMoodCheckin } from '@/hooks/useMood';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBubbleModal'>;

const EMOTIONS = [
  'joy',
  'calm',
  'anxiety',
  'love',
  'sadness',
  'anger',
  'excitement',
  'neutral',
];

const INTENSITY_DESCRIPTORS: Record<number, string> = {
  1: 'Faint Whisper',
  2: 'Soft Murmur',
  3: 'Gentle Ripple',
  4: 'Subtle Current',
  5: 'Grounded Presence',
  6: 'Steady Resonance',
  7: 'Vivid Pulse',
  8: 'Electric Surge',
  9: 'Torrential Wave',
  10: 'Cosmic Eclipse',
};

export const CreateBubbleScreen: React.FC<Props> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(7);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [locationName] = useState('San Francisco, CA');
  const [weatherCondition] = useState('Starlight Calm');
  const [weatherTemp] = useState(18);

  const emotionConfig = theme.getEmotionConfig(selectedEmotion);
  const { mutate: submitCheckin, isPending } = useMoodCheckin();

  // Smart sentiment suggestion based on content
  const detectedSentiment = useMemo(() => {
    const text = content.toLowerCase();
    if (!text.trim() || text.length < 6) return null;
    if (text.includes('happy') || text.includes('excited') || text.includes('grateful') || text.includes('smile')) {
      return { emotion: 'joy', reason: 'High warmth & radiance detected' };
    }
    if (text.includes('peace') || text.includes('quiet') || text.includes('breathe') || text.includes('rest') || text.includes('still')) {
      return { emotion: 'calm', reason: 'Grounded tranquility detected' };
    }
    if (text.includes('worry') || text.includes('panic') || text.includes('nervous') || text.includes('stress') || text.includes('racing')) {
      return { emotion: 'anxiety', reason: 'Heightened tension detected' };
    }
    if (text.includes('love') || text.includes('tender') || text.includes('heart') || text.includes('miss') || text.includes('cherish')) {
      return { emotion: 'love', reason: 'Affectionate resonance detected' };
    }
    if (text.includes('sad') || text.includes('cry') || text.includes('lonely') || text.includes('tired') || text.includes('heavy')) {
      return { emotion: 'sadness', reason: 'Gentle melancholy detected' };
    }
    return null;
  }, [content]);

  const handlePublish = () => {
    if (!content.trim()) return;

    submitCheckin(
      {
        primary_emotion: selectedEmotion,
        intensity,
        notes: content.trim(),
        is_incognito: isAnonymous,
        city: locationName,
        weather_condition: weatherCondition,
        weather_temp: weatherTemp,
        latitude: 37.7749 + (Math.random() - 0.5) * 0.02,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.02,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: () => {
          // Graceful fallback for local experience
          navigation.goBack();
        },
      }
    );
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Dynamic Atmosphere Aura Background */}
        <View
          style={[
            styles.atmosphereGlow,
            { backgroundColor: emotionConfig.glow },
          ]}
        />

        {/* Header Bar */}
        <View style={styles.header}>
          <IconButton
            icon={<Ionicons name="close" size={24} color={theme.colors.textPrimary} />}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />
          <View style={styles.headerTitleBox}>
            <Typography variant="title" weight="bold">
              Plant a Mood Bubble
            </Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Anchor your emotion in space & time
            </Typography>
          </View>
          <Button
            title="Release"
            variant="primary"
            size="sm"
            loading={isPending}
            disabled={!content.trim()}
            onPress={handlePublish}
            style={[
              styles.releaseBtn,
              { backgroundColor: emotionConfig.primary },
            ]}
          />
        </View>

        {/* Ambient Context Capsule (Location & Climate) */}
        <View style={styles.contextPillRow}>
          <View style={styles.contextPill}>
            <Ionicons name="location-outline" size={13} color={emotionConfig.primary} />
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {locationName}
            </Typography>
          </View>
          <View style={styles.contextPill}>
            <Ionicons name="cloudy-night-outline" size={13} color={theme.colors.accent} />
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {weatherCondition} • {weatherTemp}°C
            </Typography>
          </View>
        </View>

        {/* Reflection Input Card */}
        <View
          style={[
            styles.inputCard,
            { borderColor: 'rgba(255, 255, 255, 0.12)' },
          ]}
        >
          <TextInput
            placeholder="What is rippling through your mind right now? Share without fear..."
            placeholderTextColor={theme.colors.textMuted}
            value={content}
            onChangeText={setContent}
            multiline
            style={styles.textArea}
            maxLength={350}
          />
          <View style={styles.inputFooter}>
            <Typography variant="caption" color={theme.colors.textMuted}>
              {350 - content.length} characters remaining
            </Typography>
          </View>
        </View>

        {/* AI Emotion Detection Suggestion */}
        {detectedSentiment && detectedSentiment.emotion !== selectedEmotion && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedEmotion(detectedSentiment.emotion)}
            style={styles.aiSuggestionBox}
          >
            <Ionicons name="sparkles" size={16} color={theme.colors.primaryLight} />
            <View style={styles.aiSuggestionContent}>
              <Typography variant="caption" color={theme.colors.textSecondary}>
                Detected vibe:{' '}
                <Typography variant="caption" weight="bold" color={theme.colors.primaryLight}>
                  {theme.getEmotionConfig(detectedSentiment.emotion).label}
                </Typography>
              </Typography>
              <Typography variant="caption" color={theme.colors.textMuted} style={styles.aiReason}>
                {detectedSentiment.reason} • Tap to switch
              </Typography>
            </View>
          </TouchableOpacity>
        )}

        {/* Primary Emotion Selection Carousel */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="bodySmall" weight="bold" color={theme.colors.textPrimary}>
              Choose Your Signature Emotion
            </Typography>
            <Typography variant="caption" color={emotionConfig.primary} weight="bold">
              {emotionConfig.label} {emotionConfig.emoji}
            </Typography>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.emotionScroll}
          >
            {EMOTIONS.map((emo) => (
              <MoodTag
                key={emo}
                emotion={emo}
                selected={selectedEmotion === emo}
                onPress={() => setSelectedEmotion(emo)}
                style={styles.emotionTag}
              />
            ))}
          </ScrollView>
        </View>

        {/* Tactile Intensity Gauge */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Typography variant="bodySmall" weight="bold" color={theme.colors.textPrimary}>
              Resonance Intensity
            </Typography>
            <Typography variant="caption" weight="bold" color={emotionConfig.primary}>
              Level {intensity}: {INTENSITY_DESCRIPTORS[intensity]}
            </Typography>
          </View>

          <View style={styles.intensitySelectorRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
              const isActive = intensity === val;
              return (
                <TouchableOpacity
                  key={val}
                  activeOpacity={0.7}
                  onPress={() => setIntensity(val)}
                  style={[
                    styles.intensityPill,
                    isActive && {
                      backgroundColor: emotionConfig.primary,
                      borderColor: '#FFFFFF',
                      transform: [{ scale: 1.15 }],
                      shadowColor: emotionConfig.primary,
                      shadowOpacity: 0.6,
                      shadowRadius: 8,
                    },
                  ]}
                >
                  <Typography
                    variant="caption"
                    weight="bold"
                    color={isActive ? '#FFFFFF' : theme.colors.textMuted}
                  >
                    {val}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Privacy & Incognito Cloak */}
        <View style={styles.section}>
          <Typography variant="bodySmall" weight="bold" color={theme.colors.textPrimary} style={styles.sectionLabel}>
            Visibility & Cloak
          </Typography>

          <View style={styles.privacyOptionGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAnonymous(false)}
              style={[
                styles.privacyCard,
                !isAnonymous && styles.privacyCardActive,
              ]}
            >
              <View style={styles.privacyHeader}>
                <Ionicons
                  name="earth"
                  size={18}
                  color={!isAnonymous ? theme.colors.primaryLight : theme.colors.textMuted}
                />
                <Typography
                  variant="bodySmall"
                  weight="semibold"
                  color={!isAnonymous ? '#FFFFFF' : theme.colors.textSecondary}
                >
                  Public Echo
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Visible with your Aura avatar and username to cultivate connection.
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsAnonymous(true)}
              style={[
                styles.privacyCard,
                isAnonymous && styles.privacyCardActiveGhost,
              ]}
            >
              <View style={styles.privacyHeader}>
                <Typography variant="body">👻</Typography>
                <Typography
                  variant="bodySmall"
                  weight="semibold"
                  color={isAnonymous ? '#A29BFE' : theme.colors.textSecondary}
                >
                  Incognito Spirit
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Your identity dissolves into starlight. Your feeling still comforts the world.
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
    position: 'relative',
    backgroundColor: '#07080D',
  },
  keyboardView: {
    flex: 1,
  },
  atmosphereGlow: {
    position: 'absolute',
    top: -100,
    left: -50,
    right: -50,
    height: 350,
    borderRadius: 200,
    opacity: 0.18,
    pointerEvents: 'none',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  releaseBtn: {
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
  },
  contextPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputCard: {
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.lg,
    minHeight: 150,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.card,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  inputFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  aiSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.35)',
    marginBottom: theme.spacing.lg,
    gap: 10,
  },
  aiSuggestionContent: {
    flex: 1,
  },
  aiReason: {
    marginTop: 2,
    fontSize: 11,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  sectionLabel: {
    marginBottom: theme.spacing.sm,
  },
  emotionScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  emotionTag: {
    marginRight: 2,
  },
  intensitySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    padding: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  intensityPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  privacyOptionGrid: {
    gap: 10,
  },
  privacyCard: {
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    padding: 14,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  privacyCardActive: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  privacyCardActiveGhost: {
    borderColor: '#A29BFE',
    backgroundColor: 'rgba(162, 155, 254, 0.12)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
});
