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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '@/navigation/types';
import { theme, colors, getEmotionConfig, shadows } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { MoodTag } from '@/components/mood/MoodTag';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { LocationPickerModal, LocationData } from '@/components/location';
import { useMoodCheckin } from '@/hooks/useMood';
import { haptics } from '@/theme/haptics';

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
  1: 'Very Mild (1/10)',
  2: 'Mild (2/10)',
  3: 'Light (3/10)',
  4: 'Noticeable (4/10)',
  5: 'Moderate (5/10)',
  6: 'Fairly Strong (6/10)',
  7: 'Strong (7/10)',
  8: 'Very Strong (8/10)',
  9: 'Intense (9/10)',
  10: 'Overwhelming (10/10)',
};

export const CreateBubbleScreen: React.FC<Props> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(7);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [locationName, setLocationName] = useState('New Delhi, India');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.209);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [weatherCondition] = useState('Clear Sky');
  const [weatherTemp] = useState(24);

  const emotionConfig = getEmotionConfig(selectedEmotion);
  const { mutate: submitCheckin, isPending } = useMoodCheckin();

  // Smart sentiment suggestion based on content
  const detectedSentiment = useMemo(() => {
    const text = content.toLowerCase();
    if (!text.trim() || text.length < 6) return null;
    if (text.includes('happy') || text.includes('excited') || text.includes('grateful') || text.includes('smile')) {
      return { emotion: 'joy', reason: 'Sounds happy and positive' };
    }
    if (text.includes('peace') || text.includes('quiet') || text.includes('breathe') || text.includes('rest') || text.includes('still')) {
      return { emotion: 'calm', reason: 'Sounds calm and peaceful' };
    }
    if (text.includes('worry') || text.includes('panic') || text.includes('nervous') || text.includes('stress') || text.includes('racing')) {
      return { emotion: 'anxiety', reason: 'Sounds like stress or anxiety' };
    }
    if (text.includes('love') || text.includes('tender') || text.includes('heart') || text.includes('miss') || text.includes('cherish')) {
      return { emotion: 'love', reason: 'Sounds warm and caring' };
    }
    if (text.includes('sad') || text.includes('cry') || text.includes('lonely') || text.includes('tired') || text.includes('heavy')) {
      return { emotion: 'sadness', reason: 'Sounds gentle and low' };
    }
    return null;
  }, [content]);

  const handlePublish = () => {
    if (!content.trim()) return;

    haptics.medium();
    submitCheckin(
      {
        primary_emotion: selectedEmotion,
        intensity,
        notes: content.trim(),
        is_incognito: isAnonymous,
        city: locationName,
        weather_condition: weatherCondition,
        weather_temp: weatherTemp,
        latitude: latitude + (Math.random() - 0.5) * 0.005,
        longitude: longitude + (Math.random() - 0.5) * 0.005,
      },
      {
        onSuccess: () => {
          haptics.success();
          navigation.goBack();
        },
        onError: () => {
          navigation.goBack();
        },
      }
    );
  };

  const handleLocationSelect = (data: LocationData) => {
    setLocationName(data.cityName);
    setLatitude(data.latitude);
    setLongitude(data.longitude);
  };

  return (
    <View style={styles.outerWrapper}>
      {/* Emotion-reactive Aurora Background */}
      <AuroraBackground emotion={selectedEmotion} />

      <ScreenWrapper scrollable contentContainerStyle={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {/* Header Bar */}
          <View style={styles.header}>
            <IconButton
              icon={<Ionicons name="close" size={24} color={colors.textPrimary} />}
              variant="ghost"
              onPress={() => navigation.goBack()}
            />
            <View style={styles.headerTitleBox}>
              <Typography variant="h3" weight="bold">
                Share Your Mood
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Pick your feeling and drop a bubble on the map
              </Typography>
            </View>
            <Button
              title="Post Mood"
              variant="aurora"
              size="sm"
              loading={isPending}
              disabled={!content.trim()}
              onPress={handlePublish}
            />
          </View>

          {/* Ambient Context Capsule (Location & Climate) */}
          <View style={styles.contextPillRow}>
            <TouchableOpacity
              style={[styles.contextPill, styles.locationPillInteractive]}
              onPress={() => {
                setShowLocationPicker(true);
                haptics.light();
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="location-outline" size={13} color={emotionConfig.primary} />
              <Typography variant="caption" weight="semibold" color={colors.textPrimary}>
                {locationName} ▾
              </Typography>
            </TouchableOpacity>
            <View style={styles.contextPill}>
              <Ionicons name="cloudy-night-outline" size={13} color={colors.accent} />
              <Typography variant="caption" color={colors.textSecondary}>
                {weatherCondition} • {weatherTemp}°C
              </Typography>
            </View>
          </View>

          {/* Reflection Glass Input Card */}
          <View
            style={[
              styles.inputCard,
              shadows.glassGlow(emotionConfig.primary, 0.15),
              { borderColor: emotionConfig.border },
            ]}
          >
            <TextInput
              placeholder="How are you feeling right now? Share your thoughts..."
              placeholderTextColor={colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              style={styles.textArea}
              maxLength={350}
            />
            <View style={styles.inputFooter}>
              <Typography variant="caption" color={colors.textMuted}>
                {350 - content.length} characters remaining
              </Typography>
            </View>
          </View>

          {/* AI Emotion Detection Suggestion */}
          {detectedSentiment && detectedSentiment.emotion !== selectedEmotion && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                setSelectedEmotion(detectedSentiment.emotion);
                haptics.selection();
              }}
              style={styles.aiSuggestionBox}
            >
              <Ionicons name="sparkles" size={16} color={colors.primaryLight} />
              <View style={styles.aiSuggestionContent}>
                <Typography variant="caption" color={colors.textSecondary}>
                  Detected vibe:{' '}
                  <Typography variant="caption" weight="bold" color={colors.primaryLight}>
                    {getEmotionConfig(detectedSentiment.emotion).label}
                  </Typography>
                </Typography>
                <Typography variant="caption" color={colors.textMuted} style={styles.aiReason}>
                  {detectedSentiment.reason} • Tap to switch
                </Typography>
              </View>
            </TouchableOpacity>
          )}

          {/* Primary Emotion Selection Carousel */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography variant="overline" color={colors.textMuted}>
                HOW DOES IT FEEL?
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
                  onPress={() => {
                    setSelectedEmotion(emo);
                    haptics.selection();
                  }}
                  style={styles.emotionTag}
                />
              ))}
            </ScrollView>
          </View>

          {/* Tactile Intensity Gauge */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Typography variant="overline" color={colors.textMuted}>
                INTENSITY LEVEL
              </Typography>
              <Typography variant="caption" weight="bold" color={emotionConfig.primary}>
                {intensity}/10 — {INTENSITY_DESCRIPTORS[intensity]}
              </Typography>
            </View>

            <View style={styles.intensitySelectorRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                const isActive = intensity === val;
                return (
                  <TouchableOpacity
                    key={val}
                    activeOpacity={0.7}
                    onPress={() => {
                      setIntensity(val);
                      haptics.selection();
                    }}
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
                      color={isActive ? '#FFFFFF' : colors.textMuted}
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
            <Typography variant="overline" color={colors.textMuted} style={styles.sectionLabel}>
              VISIBILITY
            </Typography>

            <View style={styles.privacyOptionGrid}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setIsAnonymous(false);
                  haptics.light();
                }}
                style={[
                  styles.privacyCard,
                  !isAnonymous && styles.privacyCardActive,
                ]}
              >
                <View style={styles.privacyHeader}>
                  <Ionicons
                    name="earth"
                    size={18}
                    color={!isAnonymous ? colors.primaryLight : colors.textMuted}
                  />
                  <Typography
                    variant="bodySmall"
                    weight="semibold"
                    color={!isAnonymous ? '#FFFFFF' : colors.textSecondary}
                  >
                    Public (With your name)
                  </Typography>
                </View>
                <Typography variant="caption" color={colors.textMuted}>
                  Your name and avatar are visible to the community.
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setIsAnonymous(true);
                  haptics.light();
                }}
                style={[
                  styles.privacyCard,
                  isAnonymous && styles.privacyCardActiveGhost,
                ]}
              >
                <View style={styles.privacyHeader}>
                  <Ionicons
                    name="eye-off"
                    size={18}
                    color={isAnonymous ? colors.accent : colors.textMuted}
                  />
                  <Typography
                    variant="bodySmall"
                    weight="semibold"
                    color={isAnonymous ? '#FFFFFF' : colors.textSecondary}
                  >
                    Incognito (Anonymous)
                  </Typography>
                </View>
                <Typography variant="caption" color={colors.textMuted}>
                  Posted as a mystery traveler. Only your emotion is shown.
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScreenWrapper>

      {/* Worldwide Location Picker Modal */}
      <LocationPickerModal
        visible={showLocationPicker}
        currentLocationName={locationName}
        onSelectLocation={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleBox: {
    flex: 1,
    marginHorizontal: 12,
  },
  contextPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  locationPillInteractive: {
    borderColor: 'rgba(108, 92, 231, 0.4)',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  inputCard: {
    backgroundColor: colors.glass.surface,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    minHeight: 140,
    marginBottom: 12,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    textAlignVertical: 'top',
    minHeight: 90,
  },
  inputFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  aiSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.35)',
    marginBottom: 20,
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
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionLabel: {
    marginBottom: 10,
  },
  emotionScroll: {
    flexDirection: 'row',
    paddingVertical: 4,
    gap: 8,
  },
  emotionTag: {
    marginRight: 4,
  },
  intensitySelectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.glass.surface,
    padding: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.glass.border,
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
    backgroundColor: colors.glass.surface,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  privacyCardActive: {
    borderColor: colors.primaryLight,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  privacyCardActiveGhost: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(0, 206, 201, 0.12)',
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
});
