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
import { LocationPickerModal, LocationData } from '@/components/location';
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

  const emotionConfig = theme.getEmotionConfig(selectedEmotion);
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
          navigation.goBack();
        },
        onError: () => {
          // Graceful fallback for local experience
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
              Share Your Mood
            </Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>
              Pick your feeling and drop a bubble on the map
            </Typography>
          </View>
          <Button
            title="Post Mood"
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
          <TouchableOpacity
            style={[styles.contextPill, styles.locationPillInteractive]}
            onPress={() => setShowLocationPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="location-outline" size={13} color={emotionConfig.primary} />
            <Typography variant="caption" weight="semibold" color={theme.colors.textPrimary}>
              {locationName} ▾
            </Typography>
          </TouchableOpacity>
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
            placeholder="How are you feeling right now? Share your thoughts..."
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
              How does it feel?
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
              How strong is this feeling?
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
            Who can see this?
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
                  Public (With your name)
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Your name and avatar are visible to the community.
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
                  Anonymous
                </Typography>
              </View>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Your name and profile are hidden. Safe and private.
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={showLocationPicker}
        currentLocationName={locationName}
        onSelectLocation={handleLocationSelect}
        onClose={() => setShowLocationPicker(false)}
      />
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
  locationPillInteractive: {
    borderColor: 'rgba(108, 92, 231, 0.4)',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
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
