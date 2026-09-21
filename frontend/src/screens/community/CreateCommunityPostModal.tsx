import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { emotionInk, inkFor } from '@/theme/colors';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useCreateCommunityPost } from '@/hooks/useCommunity';
import { showAlert } from '@/components/common/AppDialog';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CreateCommunityPost'>;

const POST_TYPES = [
  { id: 'reflection', label: 'Reflection', icon: 'leaf-outline' },
  { id: 'discussion', label: 'Discussion', icon: 'chatbubbles-outline' },
  { id: 'question', label: 'Seeking Guidance', icon: 'help-circle-outline' },
  { id: 'win', label: 'Milestone / Win', icon: 'sparkles-outline' },
];

const EMOTIONS = [
  { id: 'calm', label: 'Calm', emoji: '🌊' },
  { id: 'joy', label: 'Joy', emoji: '✨' },
  { id: 'vulnerable', label: 'Vulnerable', emoji: '🤍' },
  { id: 'sadness', label: 'Sadness', emoji: '🌧️' },
  { id: 'anxiety', label: 'Anxious', emoji: '⚡' },
  { id: 'love', label: 'Love', emoji: '💖' },
  { id: 'excitement', label: 'Energetic', emoji: '🔥' },
  { id: 'neutral', label: 'Reflective', emoji: '🌿' },
];

export const CreateCommunityPostModal: React.FC<Props> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { communityId, communityName } = route.params;

  const [postType, setPostType] = useState('reflection');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [hasContentWarning, setHasContentWarning] = useState(false);

  const { mutate: createPost, isPending } = useCreateCommunityPost(communityId);

  const handleSubmit = () => {
    if (content.trim().length < 5) {
      showAlert('Reflection Needed', 'Please share a few more words for your reflection (minimum 5 characters).');
      return;
    }

    createPost(
      {
        content: content.trim(),
        post_type: postType,
        is_anonymous: isAnonymous,
        has_content_warning: hasContentWarning,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: (err: any) => {
          showAlert('Unable to release reflection', err?.message || 'Please check your connection and try again.');
        },
      }
    );
  };

  const emotionConfig = theme.getEmotionConfig(selectedEmotion);

  return (
    <ScreenWrapper style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Typography variant="body" weight="bold" color={colors.textPrimary}>
            Release Reflection
          </Typography>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={content.trim().length < 5 || isPending}
            style={[
              styles.postHeaderBtn,
              (content.trim().length < 5 || isPending) && styles.postHeaderBtnDisabled,
            ]}
          >
            <Typography variant="caption" weight="bold" color="#FFFFFF">
              {isPending ? 'Releasing...' : 'Release'}
            </Typography>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Destination Circle Pill */}
          <View style={styles.circleDestPill}>
            <Ionicons name="planet" size={14} color={colors.accentInk} />
            <Typography variant="caption" color={colors.textMuted} style={styles.destText}>
              Sharing into <Typography variant="caption" weight="bold" color={colors.textPrimary}>{communityName}</Typography>
            </Typography>
          </View>

          {/* Post Type Selector */}
          <View style={styles.fieldSection}>
            <Typography variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
              REFLECTION NATURE
            </Typography>
            <View style={styles.typeRow}>
              {POST_TYPES.map((type) => {
                const isSelected = postType === type.id;
                return (
                  <TouchableOpacity
                    key={type.id}
                    activeOpacity={0.8}
                    onPress={() => setPostType(type.id)}
                    style={[
                      styles.typePill,
                      isSelected && styles.typePillActive,
                    ]}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={14}
                      color={isSelected ? '#FFFFFF' : colors.textMuted}
                    />
                    <Typography
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                      style={styles.typeLabel}
                    >
                      {type.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Emotional Resonance Selector */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Typography variant="caption" weight="bold" color={colors.textSecondary}>
                EMOTIONAL FREQUENCY
              </Typography>
              <Typography variant="caption" weight="bold" color={emotionInk(emotionConfig, isDark)}>
                {emotionConfig.label}
              </Typography>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emotionsScroll}>
              {EMOTIONS.map((em) => {
                const isSelected = selectedEmotion === em.id;
                const emConf = theme.getEmotionConfig(em.id);
                return (
                  <TouchableOpacity
                    key={em.id}
                    activeOpacity={0.8}
                    onPress={() => setSelectedEmotion(em.id)}
                    style={[
                      styles.emotionChip,
                      isSelected && {
                        borderColor: emConf.primary,
                        backgroundColor: emConf.background,
                      },
                    ]}
                  >
                    <Typography variant="bodySmall">{em.emoji}</Typography>
                    <Typography
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? emConf.primary : colors.textSecondary}
                      style={styles.emotionChipText}
                    >
                      {em.label}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Reflection Content Text Input */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Typography variant="caption" weight="bold" color={colors.textSecondary}>
                YOUR AUTHENTIC VOICE
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {content.length}/1000
              </Typography>
            </View>
            <TextInput
              value={content}
              onChangeText={(text) => setContent(text.slice(0, 1000))}
              placeholder="What does your soul need to speak here? Your vulnerability is held with unconditional reverence..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={6}
              style={[styles.contentInput, { color: colors.textPrimary }]}
            />
          </View>

          {/* Cloak Identity Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="finger-print-outline" size={16} color={inkFor('#C084FC', isDark)} />
                <Typography variant="bodySmall" weight="bold" color={colors.textPrimary} style={styles.toggleTitle}>
                  Cloak Identity (Post Anonymously)
                </Typography>
              </View>
              <Typography variant="caption" color={colors.textMuted}>
                Masks your name and profile. You will appear as a "Wandering Spirit".
              </Typography>
            </View>
            <Switch
              value={isAnonymous}
              onValueChange={setIsAnonymous}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#FF5C38' }}
              thumbColor={isAnonymous ? '#FFFFFF' : '#A1A1AA'}
            />
          </View>

          {/* Content Warning Shield Toggle */}
          <View style={styles.toggleCard}>
            <View style={styles.toggleTextWrap}>
              <View style={styles.toggleTitleRow}>
                <Ionicons name="eye-off-outline" size={16} color={inkFor('#F87171', isDark)} />
                <Typography variant="bodySmall" weight="bold" color={colors.textPrimary} style={styles.toggleTitle}>
                  Shield Sensitive Content
                </Typography>
              </View>
              <Typography variant="caption" color={colors.textMuted}>
                Places a gentle spoiler shield over your reflection so members can opt in before reading sensitive material.
              </Typography>
            </View>
            <Switch
              value={hasContentWarning}
              onValueChange={setHasContentWarning}
              trackColor={{ false: 'rgba(255,255,255,0.1)', true: '#F87171' }}
              thumbColor={hasContentWarning ? '#FFFFFF' : '#A1A1AA'}
            />
          </View>

          {/* Bottom Submit Button */}
          <Button
            title={isPending ? 'Releasing Reflection...' : 'Release into Circle'}
            onPress={handleSubmit}
            loading={isPending}
            disabled={content.trim().length < 5}
            variant="primary"
            style={styles.bottomBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtn: {
    padding: 6,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  postHeaderBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radius.round,
    ...theme.shadows.glow(theme.colors.primary, 0.3),
  },
  postHeaderBtnDisabled: {
    opacity: 0.4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 50,
  },
  circleDestPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 92, 56, 0.12)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  destText: {
    marginLeft: 6,
  },
  fieldSection: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
  },
  typePillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  typeLabel: {
    marginLeft: 6,
  },
  emotionsScroll: {
    gap: 8,
  },
  emotionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
  },
  emotionChipText: {
    marginLeft: 4,
  },
  contentInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    height: 140,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    marginBottom: 12,
  },
  toggleTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  toggleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  toggleTitle: {
    marginLeft: 6,
  },
  bottomBtn: {
    marginTop: 12,
  },
});
