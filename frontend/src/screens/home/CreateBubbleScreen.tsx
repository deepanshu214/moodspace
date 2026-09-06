import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { MoodTag } from '@/components/mood/MoodTag';
import { Chip } from '@/components/common/Chip';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateBubbleModal'>;

const emotionsList = ['joy', 'calm', 'anxiety', 'sadness', 'love', 'anger', 'excitement', 'neutral'];

export const CreateBubbleScreen: React.FC<Props> = ({ navigation }) => {
  const [content, setContent] = useState('');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [intensity, setIntensity] = useState(7);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      navigation.goBack();
    }, 700);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="semibold">
          Create Mood Bubble
        </Typography>
        <Button
          title="Publish"
          variant="primary"
          size="sm"
          loading={isPublishing}
          disabled={!content.trim()}
          onPress={handlePublish}
        />
      </View>

      {/* Note Content Input */}
      <View style={styles.inputCard}>
        <TextInput
          placeholder="What is occupying your emotional space right now?"
          placeholderTextColor={theme.colors.textMuted}
          value={content}
          onChangeText={setContent}
          multiline
          style={styles.textArea}
        />
      </View>

      {/* AI Suggestion Preview */}
      {content.length > 10 && (
        <View style={styles.aiSuggestionBox}>
          <Ionicons name="sparkles" size={16} color={theme.colors.primaryLight} />
          <Typography variant="caption" color={theme.colors.textSecondary} style={styles.aiText}>
            AI detected emotion: <Typography variant="caption" weight="bold" color={theme.colors.primaryLight}>Calm & Reflective</Typography>
          </Typography>
        </View>
      )}

      {/* Emotion Selector */}
      <View style={styles.section}>
        <Typography variant="bodySmall" weight="semibold" color={theme.colors.textSecondary}>
          Primary Emotion
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.emotionScroll}>
          {emotionsList.map((emo) => (
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

      {/* Intensity Selector */}
      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Typography variant="bodySmall" weight="semibold" color={theme.colors.textSecondary}>
            Intensity Level
          </Typography>
          <Typography variant="bodySmall" weight="bold" color={theme.colors.primaryLight}>
            {intensity}/10
          </Typography>
        </View>
        <View style={styles.intensityRow}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
            <TouchableOpacity
              key={val}
              activeOpacity={0.7}
              onPress={() => setIntensity(val)}
              style={[
                styles.intensityCircle,
                intensity === val && styles.intensityCircleActive,
              ]}
            >
              <Typography
                variant="caption"
                weight="bold"
                color={intensity === val ? '#FFFFFF' : theme.colors.textMuted}
              >
                {val}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Privacy Mode */}
      <View style={styles.section}>
        <Typography variant="bodySmall" weight="semibold" color={theme.colors.textSecondary}>
          Privacy & Visibility
        </Typography>
        <View style={styles.privacyRow}>
          <Chip
            label="Public to Map"
            selected={!isAnonymous}
            onPress={() => setIsAnonymous(false)}
            icon={<Ionicons name="globe-outline" size={14} color="#FFFFFF" />}
          />
          <Chip
            label="Anonymous / Incognito"
            selected={isAnonymous}
            onPress={() => setIsAnonymous(true)}
            icon={<Ionicons name="eye-off-outline" size={14} color="#FFFFFF" />}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  inputCard: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    minHeight: 140,
    marginBottom: theme.spacing.md,
  },
  textArea: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    textAlignVertical: 'top',
  },
  aiSuggestionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.3)',
    marginBottom: theme.spacing.lg,
  },
  aiText: {
    marginLeft: 8,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  emotionScroll: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
  },
  emotionTag: {
    marginRight: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  intensityCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityCircleActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  privacyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: theme.spacing.sm,
  },
});
