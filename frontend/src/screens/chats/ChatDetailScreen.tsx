import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { Skeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { Ionicons } from '@expo/vector-icons';
import { useMessages, useSendMessage, useMarkRead, useDeleteMessage, useReactToMessage } from '@/hooks/useMessaging';
import { useIcebreakers } from '@/hooks/useMatching';
import { useAuthStore } from '@/stores/authStore';
import { DirectMessage, Icebreaker, MessageType } from '@/api/types';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

const EMOJI_REACTIONS = ['❤️', '😊', '🤗', '✨', '💙', '🙏', '😮', '😢'];

// Local message type for optimistic UI before API normalisation
interface LocalMessage extends DirectMessage {
  _isLocal?: boolean;
}

const MOCK_MESSAGES: LocalMessage[] = [
  {
    id: 'm-seed-1',
    conversation_id: 'conv-local',
    sender_id: 'other',
    recipient_id: 'me',
    content: "Hey! Saw your mood bubble on the map. How are you holding up?",
    message_type: 'text',
    status: 'read',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'm-seed-2',
    conversation_id: 'conv-local',
    sender_id: 'me',
    recipient_id: 'other',
    content: 'Much better now! Took a long walk near the coast.',
    message_type: 'text',
    status: 'read',
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: 'm-seed-3',
    conversation_id: 'conv-local',
    sender_id: 'other',
    recipient_id: 'me',
    content: 'That sounds peaceful. Walking near water always resets my anxiety.',
    message_type: 'icebreaker',
    status: 'delivered',
    created_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    reactions: [{ id: 'r-1', message_id: 'm-seed-3', user_id: 'me', emoji: '❤️', created_at: '' }],
  },
];

type Props2 = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

export const ChatDetailScreen: React.FC<Props2> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const {
    chatId,
    recipientName = 'Soul Explorer',
    recipientAvatar,
    recipientEmotion,
    isEchoMatch,
  } = route.params;

  const { user } = useAuthStore();
  const currentUserId = user?.id ?? 'me';

  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState('');
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<DirectMessage | null>(null);
  const [showIcebreakerPanel, setShowIcebreakerPanel] = useState(false);
  const [localMessages, setLocalMessages] = useState<LocalMessage[]>(MOCK_MESSAGES);
  const [messageType, setMessageType] = useState<MessageType>('text');

  // API hooks
  const { data: infiniteData, isLoading, refetch } = useMessages(
    chatId !== 'conv-local' ? chatId : undefined,
  );
  const sendMutation = useSendMessage(chatId);
  const deleteMutation = useDeleteMessage(chatId);
  const reactionMutation = useReactToMessage();
  const markReadMutation = useMarkRead();
  const { data: icebreakers } = useIcebreakers(recipientEmotion);

  const emotionCfg = recipientEmotion ? theme.getEmotionConfig(recipientEmotion) : null;

  // Flatten infinite pages into flat message list (newest last)
  const apiMessages = useMemo<LocalMessage[]>(() => {
    if (!infiniteData) return [];
    const all = infiniteData.pages.flatMap((p) => p.messages);
    return [...all].reverse();
  }, [infiniteData]);

  // Pick message source
  const messages = apiMessages.length > 0 ? apiMessages : localMessages;

  // Mark as read on mount
  useEffect(() => {
    if (chatId && chatId !== 'conv-local') {
      markReadMutation.mutate({ conversation_id: chatId });
    }
  }, [chatId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    if (chatId === 'conv-local') {
      // Local-only mode (demo fallback)
      const newMsg: LocalMessage = {
        id: `local-${Date.now()}`,
        conversation_id: chatId,
        sender_id: currentUserId,
        recipient_id: 'other',
        content: text,
        message_type: messageType,
        status: 'sending',
        created_at: new Date().toISOString(),
        _isLocal: true,
      };
      setLocalMessages((prev) => [...prev, newMsg]);
      setInputText('');
      setMessageType('text');
      // Simulate delivered after 800ms
      setTimeout(() => {
        setLocalMessages((prev) =>
          prev.map((m) => (m.id === newMsg.id ? { ...m, status: 'delivered' } : m)),
        );
      }, 800);
      return;
    }

    sendMutation.mutate(
      { content: text, message_type: messageType },
      {
        onSuccess: () => {
          setInputText('');
          setMessageType('text');
        },
      },
    );
  }, [inputText, chatId, currentUserId, messageType, sendMutation]);

  const handleLongPress = useCallback((message: DirectMessage) => {
    setSelectedMessage(message);
    setShowReactionModal(true);
  }, []);

  const handleReaction = useCallback(
    (emoji: string) => {
      if (!selectedMessage) return;
      if (chatId !== 'conv-local') {
        reactionMutation.mutate({ message_id: selectedMessage.id, emoji });
      } else {
        // Local mode: append reaction optimistically
        setLocalMessages((prev) =>
          prev.map((m) =>
            m.id === selectedMessage.id
              ? {
                  ...m,
                  reactions: [
                    ...(m.reactions ?? []),
                    { id: `r-${Date.now()}`, message_id: m.id, user_id: currentUserId, emoji, created_at: '' },
                  ],
                }
              : m,
          ),
        );
      }
      setShowReactionModal(false);
      setSelectedMessage(null);
    },
    [selectedMessage, chatId, currentUserId, reactionMutation],
  );

  const handleDeleteMessage = useCallback(() => {
    if (!selectedMessage) return;
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (chatId !== 'conv-local') {
              deleteMutation.mutate(selectedMessage.id);
            } else {
              setLocalMessages((prev) =>
                prev.map((m) =>
                  m.id === selectedMessage.id ? { ...m, is_deleted: true } : m,
                ),
              );
            }
            setShowReactionModal(false);
            setSelectedMessage(null);
          },
        },
      ],
    );
  }, [selectedMessage, chatId, deleteMutation]);

  const handleSendIcebreaker = useCallback(
    (icebreaker: Icebreaker) => {
      setInputText(icebreaker.prompt);
      setMessageType('icebreaker');
      setShowIcebreakerPanel(false);
    },
    [],
  );

  const renderMessage = useCallback(
    ({ item }: { item: LocalMessage }) => (
      <MessageBubble
        message={item}
        isMe={item.sender_id === currentUserId || item.sender_id === 'me'}
        onLongPress={handleLongPress}
        currentUserId={currentUserId}
      />
    ),
    [currentUserId, handleLongPress],
  );

  const keyExtractor = useCallback((item: LocalMessage) => item.id, []);

  return (
    <ScreenWrapper style={styles.container} backgroundColor={colors.background}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* ── Header ── */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
          <IconButton
            icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
            variant="ghost"
            onPress={() => navigation.goBack()}
          />

          <TouchableOpacity style={styles.recipientInfo} activeOpacity={0.8}>
            <Avatar
              source={recipientAvatar ?? undefined}
              name={recipientName}
              size="sm"
              emotion={recipientEmotion}
              showPresence
              isOnline
            />
            <View style={styles.nameCol}>
              <View style={styles.nameRow}>
                <Typography variant="title" numberOfLines={1} style={styles.recipientName}>
                  {recipientName}
                </Typography>
                {isEchoMatch && (
                  <Ionicons name="sparkles" size={13} color={colors.secondary} />
                )}
              </View>
              <Typography variant="caption" color={colors.success}>
                {emotionCfg
                  ? `${emotionCfg.emoji} Feeling ${emotionCfg.label}`
                  : 'Active now'}
              </Typography>
            </View>
          </TouchableOpacity>

          <IconButton
            icon={<Ionicons name="shield-checkmark-outline" size={20} color={colors.primaryLight} />}
            variant="ghost"
          />
        </View>

        {/* ── Encryption notice ── */}
        <View style={[styles.encryptionNotice, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          <Typography variant="caption" color={colors.textMuted} style={styles.noticeText}>
            End-to-end encrypted · Only you two can read these
          </Typography>
        </View>

        {/* ── Message list ── */}
        {isLoading ? (
          <View style={styles.loadingList}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[styles.skeletonWrapper, i % 2 === 0 ? styles.skeletonLeft : styles.skeletonRight]}
              >
                <Skeleton height={44} borderRadius={theme.radius.lg} style={{ width: 180 + i * 20 }} />
              </View>
            ))}
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onRefresh={refetch}
            refreshing={false}
            ListEmptyComponent={
              <EmptyState
                emoji="✨"
                title="Start the Conversation"
                description={`Send a message or use an icebreaker to open a heartfelt dialogue with ${recipientName}.`}
                actionTitle="Browse Icebreakers"
                onAction={() => setShowIcebreakerPanel(true)}
              />
            }
          />
        )}

        {/* ── Icebreaker panel ── */}
        {showIcebreakerPanel && (
          <View style={[styles.icebreakerPanel, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.icebreakerHeader}>
              <Typography variant="title" weight="semibold">
                💬 Choose an Icebreaker
              </Typography>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowIcebreakerPanel(false);
                    navigation.navigate('IcebreakerPicker', {
                      conversationId: chatId,
                      emotion: recipientEmotion,
                    });
                  }}
                >
                  <Typography variant="caption" color={colors.primaryLight} weight="semibold">
                    Browse All Sparks ✦
                  </Typography>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowIcebreakerPanel(false)}>
                  <Ionicons name="close" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.icebreakerScroll}>
              {(icebreakers ?? FALLBACK_ICEBREAKERS).map((ice) => (
                <TouchableOpacity
                  key={ice.id}
                  style={[styles.icebreakerChip, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => handleSendIcebreaker(ice)}
                  activeOpacity={0.75}
                >
                  <Typography variant="bodySmall" color={colors.textPrimary} style={styles.icebreakerChipText}>
                    "{ice.prompt}"
                  </Typography>
                  <View style={[styles.icebreakerCatPill, { backgroundColor: colors.surfaceHighlight }]}>
                    <Typography variant="caption" color={colors.textSecondary}>
                      {ice.category}
                    </Typography>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Composer ── */}
        <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          {/* Icebreaker type indicator */}
          {messageType === 'icebreaker' && (
            <View style={styles.icebreakerBadge}>
              <Ionicons name="chatbubble-ellipses-outline" size={12} color={colors.primaryLight} />
              <Typography variant="caption" color={colors.primaryLight}>
                Icebreaker
              </Typography>
              <TouchableOpacity onPress={() => setMessageType('text')}>
                <Ionicons name="close-circle" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.composerRow}>
            {/* Icebreaker toggle */}
            <TouchableOpacity
              style={styles.composerBtn}
              onPress={() => setShowIcebreakerPanel((v) => !v)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={showIcebreakerPanel ? colors.primary : colors.textMuted}
              />
            </TouchableOpacity>

            <TextInput
              placeholder="Send a supportive message…"
              placeholderTextColor={colors.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              style={[styles.input, { color: colors.textPrimary, backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleSend}
              style={[
                styles.sendBtn,
                !inputText.trim() && styles.sendBtnDisabled,
              ]}
              disabled={!inputText.trim() || sendMutation.isPending}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Reaction / action modal ── */}
      <Modal
        visible={showReactionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionModal(false)}
      >
        <TouchableOpacity
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
          activeOpacity={1}
          onPress={() => setShowReactionModal(false)}
        >
          <View style={[styles.reactionPanel, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Typography variant="bodySmall" color={colors.textSecondary} style={styles.reactionTitle}>
              React
            </Typography>
            <View style={styles.emojiGrid}>
              {EMOJI_REACTIONS.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => handleReaction(emoji)}
                  style={styles.emojiBtn}
                >
                  <Typography variant="display" style={styles.emojiText}>{emoji}</Typography>
                </TouchableOpacity>
              ))}
            </View>

            {/* Delete option for own messages */}
            {selectedMessage?.sender_id === currentUserId && (
              <TouchableOpacity onPress={handleDeleteMessage} style={[styles.deleteOption, { borderTopColor: colors.border }]}>
                <Ionicons name="trash-outline" size={16} color={colors.error} />
                <Typography variant="bodySmall" color={colors.error}>
                  Delete Message
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
};

// Fallback icebreakers shown when API unavailable
const FALLBACK_ICEBREAKERS: Icebreaker[] = [
  {
    id: 'fb-1',
    prompt: "What's one small thing that made you smile today?",
    category: 'gratitude',
    emotion_tags: ['joy', 'gratitude'],
  },
  {
    id: 'fb-2',
    prompt: 'If your current mood were a weather, what would it look like?',
    category: 'reflection',
    emotion_tags: ['neutral', 'calm'],
  },
  {
    id: 'fb-3',
    prompt: "What's something you've been carrying alone that you could share?",
    category: 'empathy',
    emotion_tags: ['sadness', 'anxiety'],
  },
  {
    id: 'fb-4',
    prompt: "What's a moment this week when you felt truly present?",
    category: 'presence',
    emotion_tags: ['calm', 'joy'],
  },
  {
    id: 'fb-5',
    prompt: 'What would you tell your past self from three months ago?',
    category: 'growth',
    emotion_tags: ['gratitude', 'neutral'],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  recipientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.xs,
  },
  nameCol: {
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  recipientName: {
    flexShrink: 1,
  },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
    borderBottomWidth: 1,
  },
  noticeText: {
    marginLeft: 2,
  },
  messagesList: {
    padding: theme.spacing.lg,
    paddingBottom: 16,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  loadingList: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: 8,
  },
  skeletonWrapper: {
    width: '100%',
  },
  skeletonLeft: {
    alignItems: 'flex-start',
  },
  skeletonRight: {
    alignItems: 'flex-end',
  },
  icebreakerPanel: {
    borderTopWidth: 1,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  icebreakerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icebreakerScroll: {
    gap: 10,
    paddingVertical: 4,
  },
  icebreakerChip: {
    maxWidth: 220,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderHighlight,
    gap: 6,
  },
  icebreakerChipText: {
    fontStyle: 'italic',
    lineHeight: 18,
  },
  icebreakerCatPill: {
    borderRadius: theme.radius.round,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
  },
  icebreakerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingTop: 8,
    paddingBottom: 2,
  },
  composer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  composerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  reactionPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.md,
    borderTopWidth: 1,
  },
  reactionTitle: {
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emojiGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emojiBtn: {
    padding: 8,
  },
  emojiText: {
    fontSize: 30,
  },
  deleteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    marginTop: 4,
  },
});
