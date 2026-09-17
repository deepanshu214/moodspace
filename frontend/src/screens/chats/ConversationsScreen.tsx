import React, { useCallback, useMemo } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ConversationTile } from '@/components/chat/ConversationTile';
import { Ionicons } from '@expo/vector-icons';
import { useConversations } from '@/hooks/useMessaging';
import { Conversation } from '@/api/types';

// Rich fallback data so screen looks great without a backend
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant_ids: ['me', 'u-1'],
    other_participant: {
      user_id: 'u-1',
      display_name: 'Elena Rostova',
      avatar_url: null,
      current_emotion: 'calm',
      is_online: true,
    },
    last_message: {
      id: 'm-1',
      conversation_id: 'conv-1',
      sender_id: 'u-1',
      recipient_id: 'me',
      content: "Let's check in again after your meditation session!",
      message_type: 'text',
      status: 'delivered',
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    },
    unread_count: 2,
    resonance_score: 87,
    is_echo_match: true,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-2',
    participant_ids: ['me', 'u-2'],
    other_participant: {
      user_id: 'u-2',
      display_name: 'Kai Takahashi',
      avatar_url: null,
      current_emotion: 'gratitude',
      is_online: false,
      last_seen_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    last_message: {
      id: 'm-2',
      conversation_id: 'conv-2',
      sender_id: 'me',
      recipient_id: 'u-2',
      content: 'Appreciate you listening yesterday, it helped a lot.',
      message_type: 'text',
      status: 'read',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    unread_count: 0,
    resonance_score: 72,
    is_echo_match: false,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'conv-3',
    participant_ids: ['me', 'u-3'],
    other_participant: {
      user_id: 'u-3',
      display_name: '🌀 Wandering Spirit',
      avatar_url: null,
      current_emotion: 'sadness',
      is_online: true,
      last_seen_at: undefined,
    },
    last_message: {
      id: 'm-3',
      conversation_id: 'conv-3',
      sender_id: 'u-3',
      recipient_id: 'me',
      content: 'Thank you for understanding without judging.',
      message_type: 'icebreaker',
      status: 'delivered',
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    unread_count: 1,
    resonance_score: 94,
    is_echo_match: true,
    created_at: new Date().toISOString(),
    updated_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

type Props = NativeStackScreenProps<ChatStackParamList, 'Conversations'>;

export const ConversationsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { data: apiConversations, isLoading, isRefetching, refetch, isError } = useConversations();

  // Use API data if available, else rich fallback
  const conversations: Conversation[] = useMemo(() => {
    if (apiConversations && apiConversations.length > 0) return apiConversations;
    return MOCK_CONVERSATIONS;
  }, [apiConversations]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + c.unread_count, 0),
    [conversations],
  );

  const handleOpenChat = useCallback(
    (conversation: Conversation) => {
      navigation.navigate('ChatDetail', {
        chatId: conversation.id,
        recipientName: conversation.other_participant.display_name,
        recipientAvatar: conversation.other_participant.avatar_url,
        recipientEmotion: conversation.other_participant.current_emotion,
        isEchoMatch: conversation.is_echo_match,
      });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Conversation }) => (
      <ConversationTile conversation={item} onPress={() => handleOpenChat(item)} />
    ),
    [handleOpenChat],
  );

  const keyExtractor = useCallback((item: Conversation) => item.id, []);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Typography variant="h1" weight="bold">
            Echoes
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Private, encrypted conversations with your resonant connections.
          </Typography>
        </View>

        {/* Echo Match CTA */}
        <TouchableOpacity
          style={styles.echoFab}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('EchoMatch')}
        >
          <Ionicons name="sparkles" size={18} color={colors.secondary} />
        </TouchableOpacity>
      </View>

      {/* Unread pill */}
      {totalUnread > 0 && (
        <View style={styles.unreadBanner}>
          <Ionicons name="notifications-circle" size={16} color={colors.primary} />
          <Typography variant="bodySmall" color={colors.textPrimary}>
            {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
          </Typography>
        </View>
      )}

      {/* Skeleton loading */}
      {isLoading && (
        <View style={styles.list}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={72} borderRadius={theme.radius.lg} style={styles.skeletonItem} />
          ))}
        </View>
      )}

      {/* Conversation list */}
      {!isLoading && (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="💬"
              title="No Echoes Yet"
              description="Connect with others who resonate with your emotional journey. Tap the sparkle to find your first Echo match."
              actionTitle="Find Echo Matches"
              onAction={() => navigation.navigate('EchoMatch')}
            />
          }
        />
      )}

      {/* Find matches FAB (bottom) */}
      {conversations.length > 0 && (
        <TouchableOpacity
          style={styles.matchFab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('EchoMatch')}
        >
          <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
          <Typography variant="bodySmall" color="#FFFFFF" weight="semibold">
            Find Echo Matches
          </Typography>
        </TouchableOpacity>
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  subtitle: {
    marginTop: 4,
    maxWidth: 240,
  },
  echoFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(253, 121, 168, 0.12)',
    borderWidth: 1,
    borderColor: theme.colors.secondary + '40',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  unreadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    borderRadius: theme.radius.round,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: theme.colors.borderHighlight,
  },
  list: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 100,
    gap: 8,
  },
  separator: {
    height: 0,
  },
  skeletonItem: {
    marginBottom: 8,
  },
  matchFab: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.round,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
});
