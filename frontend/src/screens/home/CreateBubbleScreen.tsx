import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
} from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '@/navigation/types';
import { getEmotionConfig, emotionInk, inkOnPastel } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { PingDot } from '@/components/common/PingDot';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { MoodGlyph, toMoodKey } from '@/components/mood/MoodGlyph';
import { LocationPickerModal, LocationData } from '@/components/location';
import { useMoodCheckin } from '@/hooks/useMood';
import { useAuthStore } from '@/stores/authStore';
import { saveUserPostedBubble, expiryFromNow } from '@/utils/userPosts';
import { moodApi } from '@/api/mood';
import { haptics } from '@/theme/haptics';
import { showAlert } from '@/components/common/AppDialog';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBubbleModal'>;

const EMOTIONS = [
  'joy',
  'calm',
  'love',
  'sadness',
  'anxiety',
  'anger',
  'loneliness',
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

/** mm:ss for the recorder chip. */
const formatDuration = (ms: number) => {
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const MAX_NOTE = 280;
const MAX_TAGS = 4;

export const CreateBubbleScreen: React.FC<Props> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
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
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [voiceUri, setVoiceUri] = useState<string | null>(null);
  const [voiceDurationMs, setVoiceDurationMs] = useState<number>(0);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);
  const isRecording = recorderState.isRecording;

  const { user } = useAuthStore();
  const emotionConfig = getEmotionConfig(selectedEmotion);
  const moodInk = emotionInk(emotionConfig, isDark);
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

  const addTag = () => {
    const clean = tagDraft.trim().replace(/^#+/, '').slice(0, 24);
    if (!clean || tags.includes(clean) || tags.length >= MAX_TAGS) return;
    setTags([...tags, clean]);
    setTagDraft('');
    haptics.light();
  };

  const attachPhoto = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert('Photo Access Needed', 'Allow photo access to attach a keepsake to your bubble.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        haptics.success();
      }
    } catch (e) {
      console.warn('[CreateBubble] Photo attach failed:', e);
    }
  };

  const toggleRecording = async () => {
    try {
      if (isRecording) {
        await recorder.stop();
        // `recorder.uri` is the finished file; duration comes from the last status.
        if (recorder.uri) {
          setVoiceUri(recorder.uri);
          setVoiceDurationMs(recorderState.durationMillis ?? 0);
          haptics.success();
        }
        return;
      }

      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) {
        showAlert('Microphone Needed', 'Allow microphone access to attach a voice note.');
        return;
      }
      await recorder.prepareToRecordAsync();
      recorder.record();
      haptics.medium();
    } catch (e) {
      console.warn('[CreateBubble] Voice note failed:', e);
      showAlert('Recording Failed', 'That voice note could not be captured. Please try again.');
    }
  };

  /**
   * Keepsakes upload after the bubble exists, so a failed upload never costs
   * the person their post — the bubble stands, minus the attachment.
   */
  const uploadKeepsakes = async (bubbleId: string) => {
    try {
      if (photoUri) {
        const ext = photoUri.split('.').pop()?.toLowerCase();
        const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        await moodApi.attachKeepsake(bubbleId, { uri: photoUri, name: `keepsake.${ext || 'jpg'}`, type }, 'photo');
      }
      if (voiceUri) {
        await moodApi.attachKeepsake(
          bubbleId,
          { uri: voiceUri, name: 'voice-note.m4a', type: 'audio/m4a' },
          'voice',
          voiceDurationMs,
        );
      }
    } catch (e) {
      console.warn('[CreateBubble] Keepsake upload failed:', e);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) return;

    haptics.medium();

    const newLat = latitude + (Math.random() - 0.5) * 0.005;
    const newLng = longitude + (Math.random() - 0.5) * 0.005;

    // Locally persist user post immediately so they can always view what they posted
    const newBubble = {
      id: `my-post-${Date.now()}`,
      authorName: isAnonymous ? 'Anonymous Friend' : (user?.displayName || 'Elena Rostova'),
      auraScore: 450,
      emotion: selectedEmotion,
      secondaryEmotion: selectedEmotion.charAt(0).toUpperCase() + selectedEmotion.slice(1),
      intensity,
      content: content.trim(),
      locationCity: locationName,
      weatherCondition,
      weatherTemp,
      timestamp: 'Just now',
      createdAt: new Date().toISOString(),
      expiresAt: expiryFromNow(),
      likesCount: 0,
      commentsCount: 0,
      isAnonymous,
      latitude: newLat,
      longitude: newLng,
      tags,
      photoUri: photoUri ?? undefined,
      voiceUri: voiceUri ?? undefined,
      voiceDurationMs: voiceDurationMs || undefined,
    };

    try {
      await saveUserPostedBubble(newBubble);
    } catch (e) {
      console.warn('[CreateBubble] Failed to save user post locally:', e);
    }

    submitCheckin(
      {
        primary_emotion: selectedEmotion,
        intensity,
        notes: content.trim(),
        is_incognito: isAnonymous,
        city: locationName,
        weather_condition: weatherCondition,
        weather_temp: weatherTemp,
        latitude: newLat,
        longitude: newLng,
        tags,
      },
      {
        onSuccess: async (created: any) => {
          if (created?.id && (photoUri || voiceUri)) {
            await uploadKeepsakes(created.id);
          }
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
    <ScreenWrapper backgroundColor={colors.background} style={styles.container}>
      {/* ── Masthead ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.iconBtn, { borderColor: colors.ink, backgroundColor: colors.surface }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="h4" style={{ color: colors.textPrimary, flex: 1, marginLeft: 12 }}>
          Share Your Mood
        </Typography>
        <View style={[styles.syncBadge, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}>
          <PingDot size={7} />
          <Typography variant="overline" style={{ color: colors.textPrimary, marginLeft: 6 }}>
            LIVE SYNC
          </Typography>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Typography variant="h2" style={{ color: colors.textPrimary }}>
            How are you feeling right now?
          </Typography>
          <Typography variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 6 }}>
            Pick a frequency. Your bubble floats onto the shared world canvas for nearby wanderers.
          </Typography>

          {/* ① Frequency grid */}
          <View style={styles.sectionHeader}>
            <Typography variant="overline" style={{ color: colors.textMuted }}>
              SELECT FREQUENCY
            </Typography>
            <Typography variant="caption" style={{ color: colors.textMuted }}>
              {emotionConfig.label}
            </Typography>
          </View>

          <View style={styles.grid}>
            {EMOTIONS.map((emo) => {
              const cfg = getEmotionConfig(emo);
              const isSelected = selectedEmotion === emo;
              return (
                <Tactile
                  key={emo}
                  offset={isSelected ? 4 : 2}
                  radius={16}
                  backgroundColor={isSelected ? cfg.primary : colors.surface}
                  style={styles.gridCell}
                  contentStyle={styles.gridTile}
                  onPress={() => {
                    setSelectedEmotion(emo);
                    haptics.selection();
                  }}
                  accessibilityLabel={`Select ${cfg.label}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <MoodGlyph
                    mood={toMoodKey(emo)}
                    size={26}
                    color={isSelected ? inkOnPastel : emotionInk(cfg, isDark)}
                  />
                  <Typography
                    variant="label"
                    style={{ color: isSelected ? inkOnPastel : colors.textSecondary, marginTop: 6 }}
                  >
                    {cfg.label}
                  </Typography>
                </Tactile>
              );
            })}
          </View>

          {/* Sentiment nudge */}
          {detectedSentiment && detectedSentiment.emotion !== selectedEmotion && (
            <TouchableOpacity
              onPress={() => {
                setSelectedEmotion(detectedSentiment.emotion);
                haptics.light();
              }}
              style={[styles.nudge, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}
              accessibilityRole="button"
              accessibilityLabel={`Switch to ${getEmotionConfig(detectedSentiment.emotion).label}`}
            >
              <MoodGlyph
                mood={toMoodKey(detectedSentiment.emotion)}
                size={16}
                color={emotionInk(getEmotionConfig(detectedSentiment.emotion), isDark)}
              />
              <Typography variant="caption" style={{ color: colors.textSecondary, marginLeft: 8, flex: 1 }}>
                {detectedSentiment.reason} • Tap to switch to{' '}
                {getEmotionConfig(detectedSentiment.emotion).label}
              </Typography>
            </TouchableOpacity>
          )}

          {/* ② Vibe dial */}
          <Tactile offset={4} radius={20} style={styles.block} contentStyle={styles.card}>
            <View style={styles.rowBetween}>
              <Typography variant="h4" style={{ color: colors.textPrimary }}>
                Vibe Dial
              </Typography>
              <Typography variant="caption" weight="bold" style={{ color: moodInk }}>
                {intensity}/10 — {INTENSITY_DESCRIPTORS[intensity]}
              </Typography>
            </View>

            <View style={styles.dialRow}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                const isOn = val <= intensity;
                return (
                  <TouchableOpacity
                    key={val}
                    onPress={() => {
                      setIntensity(val);
                      haptics.selection();
                    }}
                    accessibilityRole="adjustable"
                    accessibilityLabel={`Intensity ${val} of 10`}
                    style={[
                      styles.dialBar,
                      {
                        backgroundColor: isOn ? emotionConfig.primary : colors.surfaceElevated,
                        borderColor: colors.ink,
                        height: 18 + val * 2.6,
                      },
                    ]}
                  />
                );
              })}
            </View>

            <View style={styles.rowBetween}>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
                SOFT
              </Typography>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
                BALANCED
              </Typography>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
                ULTRA
              </Typography>
            </View>
          </Tactile>

          {/* ③ Candid whisper */}
          <Tactile offset={4} radius={20} style={styles.block} contentStyle={styles.card}>
            <View style={styles.rowBetween}>
              <Typography variant="h4" style={{ color: colors.textPrimary }}>
                Candid Whisper
              </Typography>
              <Typography variant="overline" style={{ color: content.length > MAX_NOTE - 20 ? colors.errorInk : colors.textMuted }}>
                {content.length} / {MAX_NOTE}
              </Typography>
            </View>
            <TextInput
              value={content}
              onChangeText={(t) => setContent(t.slice(0, MAX_NOTE))}
              placeholder="What does this moment feel like?"
              placeholderTextColor={colors.textMuted}
              multiline
              style={[styles.input, { color: colors.textPrimary, borderColor: colors.border }]}
              accessibilityLabel="Your mood note"
            />

            {/* tags */}
            <View style={styles.tagRow}>
              {tags.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTags(tags.filter((x) => x !== t))}
                  style={[styles.tagChip, { borderColor: colors.ink, backgroundColor: emotionConfig.background }]}
                  accessibilityLabel={`Remove tag ${t}`}
                >
                  <Typography variant="overline" style={{ color: moodInk }}>
                    #{t.toUpperCase()} ✕
                  </Typography>
                </TouchableOpacity>
              ))}
              {tags.length < MAX_TAGS && (
                <View style={[styles.tagInputWrap, { borderColor: colors.border }]}>
                  <TextInput
                    value={tagDraft}
                    onChangeText={setTagDraft}
                    onSubmitEditing={addTag}
                    placeholder="add tag"
                    placeholderTextColor={colors.textMuted}
                    style={[styles.tagInput, { color: colors.textPrimary }]}
                    returnKeyType="done"
                    accessibilityLabel="Add a tag"
                  />
                  <TouchableOpacity onPress={addTag} accessibilityLabel="Add tag">
                    <Ionicons name="add" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </Tactile>

          {/* ④ Sensory keepsakes */}
          <Tactile offset={4} radius={20} style={styles.block} contentStyle={styles.card}>
            <View style={styles.rowBetween}>
              <Typography variant="h4" style={{ color: colors.textPrimary }}>
                Sensory Keepsakes
              </Typography>
              <Typography variant="overline" style={{ color: colors.textMuted }}>
                {(photoUri ? 1 : 0) + (voiceUri ? 1 : 0) > 0
                  ? `${(photoUri ? 1 : 0) + (voiceUri ? 1 : 0)} ATTACHED`
                  : 'OPTIONAL'}
              </Typography>
            </View>

            <View style={styles.keepsakeRow}>
              <TouchableOpacity
                onPress={attachPhoto}
                style={[styles.polaroid, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}
                accessibilityLabel={photoUri ? 'Replace attached photo' : 'Attach a photo'}
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.polaroidImage} resizeMode="cover" />
                ) : (
                  <>
                    <Ionicons name="image-outline" size={22} color={colors.textSecondary} />
                    <Typography variant="overline" style={{ color: colors.textSecondary, marginTop: 4 }}>
                      POLAROID
                    </Typography>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={toggleRecording}
                style={[
                  styles.polaroid,
                  !voiceUri && styles.soonTile,
                  {
                    borderColor: isRecording ? colors.error : voiceUri ? colors.ink : colors.border,
                    backgroundColor: voiceUri ? colors.surfaceWarm : 'transparent',
                  },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isRecording }}
                accessibilityLabel={
                  isRecording ? 'Stop recording' : voiceUri ? 'Re-record voice note' : 'Record a voice note'
                }
              >
                <Ionicons
                  name={isRecording ? 'stop-circle' : voiceUri ? 'mic' : 'mic-outline'}
                  size={22}
                  color={isRecording ? colors.error : voiceUri ? moodInk : colors.textMuted}
                />
                <Typography
                  variant="overline"
                  style={{ color: isRecording ? colors.error : colors.textSecondary, marginTop: 4 }}
                >
                  {isRecording
                    ? formatDuration(recorderState.durationMillis ?? 0)
                    : voiceUri
                      ? formatDuration(voiceDurationMs)
                      : 'VOICE'}
                </Typography>
                {isRecording && (
                  <View style={[styles.soonBadge, { backgroundColor: colors.error }]}>
                    <Typography variant="overline" style={{ color: '#FFFFFF' }}>
                      REC
                    </Typography>
                  </View>
                )}
              </TouchableOpacity>

              {voiceUri && !isRecording && (
                <TouchableOpacity
                  onPress={() => {
                    setVoiceUri(null);
                    setVoiceDurationMs(0);
                    haptics.light();
                  }}
                  style={[styles.removePhoto, { borderColor: colors.ink, backgroundColor: colors.surface }]}
                  accessibilityLabel="Remove voice note"
                >
                  <Ionicons name="close" size={16} color={colors.errorInk} />
                </TouchableOpacity>
              )}

              {photoUri && (
                <TouchableOpacity
                  onPress={() => setPhotoUri(null)}
                  style={[styles.removePhoto, { borderColor: colors.ink, backgroundColor: colors.surface }]}
                  accessibilityLabel="Remove attached photo"
                >
                  <Ionicons name="trash-outline" size={16} color={colors.errorInk} />
                </TouchableOpacity>
              )}
            </View>
          </Tactile>

          {/* ⑤ Location */}
          <Tactile offset={4} radius={20} style={styles.block} contentStyle={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.locationLeft}>
                <Ionicons name="location-outline" size={18} color={moodInk} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Typography variant="label" numberOfLines={1} style={{ color: colors.textPrimary }}>
                    {locationName}
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>
                    Approximate area • Privacy protected
                  </Typography>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setShowLocationPicker(true)}
                style={[styles.editPill, { borderColor: colors.ink, backgroundColor: colors.surfaceWarm }]}
                accessibilityLabel="Change location"
              >
                <Typography variant="overline" style={{ color: colors.textPrimary }}>
                  EDIT
                </Typography>
              </TouchableOpacity>
            </View>
          </Tactile>

          {/* ⑥ Auto-dissolve */}
          <Tactile
            offset={4}
            radius={20}
            style={styles.block}
            backgroundColor={colors.surfaceWarm}
            contentStyle={styles.card}
          >
            <View style={styles.rowBetween}>
              <Typography variant="overline" style={{ color: colors.textPrimary }}>
                AUTO-DISSOLVE
              </Typography>
              <View style={[styles.burnBadge, { backgroundColor: colors.primary, borderColor: colors.ink }]}>
                <Typography variant="overline" style={{ color: inkOnPastel }}>
                  BURNS IN 24H
                </Typography>
              </View>
            </View>
            <Typography variant="body" style={{ color: colors.textPrimary, marginTop: 8 }}>
              Floats for 24 hours
            </Typography>
            <Typography variant="caption" style={{ color: colors.textSecondary, marginTop: 2 }}>
              Then softly fades, leaving zero trace on your device.
            </Typography>
          </Tactile>

          {/* ⑦ Anonymity */}
          <Tactile offset={4} radius={20} style={styles.block} contentStyle={styles.card}>
            <View style={styles.rowBetween}>
              <View style={styles.locationLeft}>
                <Ionicons name="eye-off-outline" size={18} color={colors.textSecondary} />
                <View style={{ marginLeft: 8, flex: 1 }}>
                  <Typography variant="label" style={{ color: colors.textPrimary }}>
                    Float Anonymously
                  </Typography>
                  <Typography variant="caption" style={{ color: colors.textMuted }}>
                    Hide your avatar and profile handle
                  </Typography>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsAnonymous(!isAnonymous);
                  haptics.selection();
                }}
                accessibilityRole="switch"
                accessibilityState={{ checked: isAnonymous }}
                accessibilityLabel="Float anonymously"
                style={[
                  styles.switchTrack,
                  {
                    borderColor: colors.ink,
                    backgroundColor: isAnonymous ? colors.accent : colors.surfaceElevated,
                  },
                ]}
              >
                <View
                  style={[
                    styles.switchThumb,
                    { backgroundColor: colors.surface, borderColor: colors.ink },
                    isAnonymous && styles.switchThumbOn,
                  ]}
                />
              </TouchableOpacity>
            </View>
          </Tactile>

          {/* ⑧ Publish */}
          <Tactile
            offset={4}
            radius={16}
            backgroundColor={content.trim() && !isPending ? colors.primary : colors.surfaceElevated}
            style={styles.block}
            contentStyle={styles.publishBtn}
            onPress={handlePublish}
            disabled={!content.trim() || isPending}
            accessibilityLabel="Drop my bubble"
          >
            <Typography
              variant="button"
              style={{ color: content.trim() && !isPending ? inkOnPastel : colors.textMuted }}
            >
              {isPending ? 'Dropping…' : 'Drop my bubble'}
            </Typography>
          </Tactile>

          <Typography variant="caption" align="center" style={{ color: colors.textMuted, marginTop: 10 }}>
            Instantly visible to wanderers nearby • Floats for 24 hours
          </Typography>
        </ScrollView>
      </KeyboardAvoidingView>

      <LocationPickerModal
        visible={showLocationPicker}
        currentLocationName={locationName}
        onClose={() => setShowLocationPicker(false)}
        onSelectLocation={handleLocationSelect}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridCell: {
    width: '31%',
    marginBottom: 10,
  },
  gridTile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  nudge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 10,
    marginTop: 4,
  },
  block: {
    marginTop: 14,
  },
  card: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginVertical: 14,
  },
  dialBar: {
    width: '8%',
    borderWidth: 2,
    borderRadius: 6,
  },
  input: {
    minHeight: 90,
    borderWidth: 2,
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 10,
  },
  tagChip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 6,
  },
  tagInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginTop: 6,
  },
  tagInput: {
    minWidth: 70,
    paddingVertical: 4,
    fontSize: 12,
  },
  keepsakeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  polaroid: {
    width: 84,
    height: 96,
    borderWidth: 2,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  polaroidImage: {
    width: '100%',
    height: '100%',
  },
  soonTile: {
    borderStyle: 'dashed',
  },
  soonBadge: {
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 6,
  },
  removePhoto: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  editPill: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  burnBadge: {
    borderWidth: 2,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  switchTrack: {
    width: 52,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  publishBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
