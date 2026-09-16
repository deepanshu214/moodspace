import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { AuraDisplay } from '../social/AuraDisplay';
import { ReactionFloater } from './ReactionFloater';
import { haptics } from '@/theme/haptics';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const EMPATHY_REACTIONS = [
  { type: 'heart', label: 'Support', emoji: '❤️', icon: 'heart', color: '#FD79A8' },
  { type: 'hug', label: 'Hug', emoji: '🤗', icon: 'hand-left', color: '#A29BFE' },
  { type: 'empathy', label: 'With You', emoji: '🌊', icon: 'water', color: '#00CEC9' },
  { type: 'celebrate', label: 'Celebrate', emoji: '✨', icon: 'sparkles', color: '#FFB800' },
];

export interface BubbleDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  bubble: {
    id: string;
    authorName: string;
    authorAvatar?: string;
    auraScore?: number;
    emotion: string;
    secondaryEmotion?: string;
    intensity: number;
    content: string;
    locationCity?: string;
    weatherCondition?: string;
    weatherTemp?: number;
    timestamp?: string;
    likesCount?: number;
    commentsCount?: number;
    isAnonymous?: boolean;
  } | null;
  onSendEcho?: (bubbleId: string, text: string) => void;
  onNavigateDetails?: (bubbleId: string) => void;
}

export const BubbleDetailSheet: React.FC<BubbleDetailSheetProps> = ({
  visible,
  onClose,
  bubble,
  onSendEcho,
  onNavigateDetails,
}) => {
  if (!bubble) return null;

  const [echoText, setEchoText] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [floaterKey, setFloaterKey] = useState(0);
  const [floaterEmoji, setFloaterEmoji] = useState('❤️');
  const [resonanceCount, setResonanceCount] = useState(bubble.likesCount || 0);

  const config = theme.getEmotionConfig(bubble.emotion);
  const heartScale = useSharedValue(1);

  const handleReactionPress = (rx: typeof EMPATHY_REACTIONS[0]) => {
    haptics.medium();
    if (selectedReaction === rx.type) {
      setSelectedReaction(null);
      setResonanceCount((prev) => Math.max(0, prev - 1));
    } else {
      setSelectedReaction(rx.type);
      setFloaterEmoji(rx.emoji);
      setFloaterKey(Date.now());
      setResonanceCount((prev) => (selectedReaction ? prev : prev + 1));
      heartScale.value = withSequence(
        withSpring(1.3, { damping: 4, stiffness: 220 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
    }
  };

  const handleSend = () => {
    if (!echoText.trim()) return;
    onSendEcho?.(bubble.id, echoText.trim());
    setEchoText('');
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heartScale.value }],
  }));

  const isAnon = bubble.isAnonymous;
  const authorTitle = isAnon ? 'Anonymous Friend' : bubble.authorName;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Backdrop dismiss touchable */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Sliding Sheet Card */}
        <View style={styles.sheetContainer}>
          {/* Sheet Drag Indicator */}
          <View style={styles.dragPillContainer}>
            <View style={styles.dragPill} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header: Author Info & Aura */}
            <View style={styles.headerRow}>
              <View style={styles.authorMeta}>
                {isAnon ? (
                  <View style={styles.anonAvatar}>
                    <Typography variant="title">👻</Typography>
                  </View>
                ) : (
                  <Avatar
                    source={bubble.authorAvatar}
                    name={bubble.authorName}
                    size="md"
                    emotion={bubble.emotion}
                  />
                )}
                <View style={styles.authorTexts}>
                  <Typography variant="body" weight="bold" color={theme.colors.textPrimary}>
                    {authorTitle}
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textMuted}>
                    {bubble.timestamp || 'Moments ago'}
                  </Typography>
                </View>
              </View>

              {!isAnon && bubble.auraScore && (
                <AuraDisplay score={bubble.auraScore} variant="compact" />
              )}
            </View>

            {/* Context Weather Capsule (if available) */}
            {(bubble.locationCity || bubble.weatherCondition) && (
              <View style={styles.weatherPill}>
                <Ionicons name="location-sharp" size={12} color={theme.colors.primaryLight} />
                <Typography variant="caption" color={theme.colors.textSecondary} style={styles.weatherText}>
                  {bubble.locationCity || 'Nearby'}
                  {bubble.weatherCondition ? ` • ${bubble.weatherCondition}` : ''}
                  {bubble.weatherTemp ? ` (${bubble.weatherTemp}°C)` : ''}
                </Typography>
              </View>
            )}

            {/* Emotion & Intensity Highlight Bar */}
            <View
              style={[
                styles.emotionHighlightCard,
                { backgroundColor: config.background, borderColor: config.primary },
              ]}
            >
              <View style={styles.emotionTitleRow}>
                <View style={styles.emotionBadge}>
                  <Typography variant="body">{config.emoji}</Typography>
                  <Typography
                    variant="bodySmall"
                    weight="bold"
                    color={config.primary}
                    style={styles.emotionName}
                  >
                    {config.label}
                  </Typography>
                </View>

                {bubble.secondaryEmotion && (
                  <View style={styles.secondaryPill}>
                    <Typography variant="caption" color={theme.colors.textSecondary}>
                      + {bubble.secondaryEmotion}
                    </Typography>
                  </View>
                )}

                <View style={styles.intensityCounter}>
                  <Typography variant="caption" weight="bold" color="#FFFFFF">
                    Intensity: {bubble.intensity}/10
                  </Typography>
                </View>
              </View>

              {/* Intensity Progress Line */}
              <View style={styles.intensityBarTrack}>
                <View
                  style={[
                    styles.intensityBarFill,
                    {
                      width: `${(bubble.intensity / 10) * 100}%`,
                      backgroundColor: config.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Note Text Reflection */}
            <View style={styles.contentBox}>
              <Typography
                variant="body"
                color={theme.colors.textPrimary}
                style={styles.reflectionText}
              >
                "{bubble.content}"
              </Typography>
            </View>

            {/* Empathy Reaction Bar */}
            <View style={styles.reactionSection}>
              <Typography variant="overline" color={theme.colors.textMuted} style={{ marginBottom: 8 }}>
                SEND WARMTH & EMPATHY ({resonanceCount})
              </Typography>

              <View style={styles.reactionGrid}>
                {EMPATHY_REACTIONS.map((rx) => {
                  const isSelected = selectedReaction === rx.type;
                  return (
                    <TouchableOpacity
                      key={rx.type}
                      activeOpacity={0.7}
                      onPress={() => handleReactionPress(rx)}
                      style={[
                        styles.reactionPill,
                        isSelected && {
                          backgroundColor: `${rx.color}28`,
                          borderColor: rx.color,
                        },
                      ]}
                    >
                      {isSelected && (
                        <ReactionFloater emoji={floaterEmoji} triggerKey={floaterKey} />
                      )}
                      <Typography style={{ fontSize: 16, marginRight: 6 }}>{rx.emoji}</Typography>
                      <Typography
                        variant="caption"
                        weight={isSelected ? 'bold' : 'semibold'}
                        color={isSelected ? rx.color : theme.colors.textSecondary}
                      >
                        {rx.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {onNavigateDetails && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    onClose();
                    onNavigateDetails(bubble.id);
                  }}
                  style={styles.detailLinkBtn}
                >
                  <Typography variant="caption" weight="semibold" color={theme.colors.primaryLight}>
                    Open Full Thread
                  </Typography>
                  <Ionicons name="arrow-forward" size={14} color={theme.colors.primaryLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Quick Empathy Echo Input */}
            <View style={styles.replyBar}>
              <TextInput
                placeholder="Send a comforting echo..."
                placeholderTextColor={theme.colors.textMuted}
                value={echoText}
                onChangeText={setEchoText}
                style={styles.replyInput}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSend}
                disabled={!echoText.trim()}
                style={[
                  styles.replySendBtn,
                  !echoText.trim() && { opacity: 0.4 },
                ]}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: '#0F121C',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    maxHeight: SCREEN_HEIGHT * 0.85,
    paddingTop: 12,
    paddingBottom: 36,
    ...theme.shadows.elevated,
  },
  dragPillContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragPill: {
    width: 42,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  authorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  anonAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(162, 155, 254, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(162, 155, 254, 0.5)',
  },
  authorTexts: {
    gap: 2,
  },
  weatherPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    alignSelf: 'flex-start',
    marginBottom: 14,
    gap: 4,
  },
  weatherText: {
    fontSize: 12,
  },
  emotionHighlightCard: {
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  emotionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  emotionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  emotionName: {
    textTransform: 'capitalize',
  },
  secondaryPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  intensityCounter: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  intensityBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  intensityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  contentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16,
  },
  reflectionText: {
    fontSize: 15,
    lineHeight: 23,
    fontStyle: 'italic',
  },
  reactionSection: {
    marginBottom: 16,
  },
  reactionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  reactionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionCount: {
    fontSize: 12,
  },
  detailLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 4,
  },
  replyInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    paddingVertical: 6,
  },
  replySendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
