import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';

type Props = NativeStackScreenProps<ChatStackParamList, 'Conversations'>;

const mockChats = [
  {
    id: 'chat-1',
    name: 'Elena Rostova',
    emotion: 'calm',
    lastMessage: 'Let’s check in again after your meditation session!',
    time: '14:20',
    unreadCount: 2,
    online: true,
  },
  {
    id: 'chat-2',
    name: 'Sarah Chen',
    emotion: 'joy',
    lastMessage: 'The emotional map looked so bright today in our city ✨',
    time: 'Yesterday',
    unreadCount: 0,
    online: false,
  },
  {
    id: 'chat-3',
    name: 'Kai Takahashi',
    emotion: 'anxiety',
    lastMessage: 'Appreciate you listening yesterday, helped a lot.',
    time: '2d ago',
    unreadCount: 0,
    online: true,
  },
];

export const ConversationsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Typography variant="h1" weight="bold">
          Messages
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Private, supportive direct dialogues with mutual connections.
        </Typography>
      </View>

      <View style={styles.list}>
        {mockChats.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            activeOpacity={0.75}
            onPress={() =>
              navigation.navigate('ChatDetail', {
                chatId: chat.id,
                recipientName: chat.name,
              })
            }
            style={styles.chatRow}
          >
            <Avatar
              name={chat.name}
              size="md"
              emotion={chat.emotion}
              showPresence
              isOnline={chat.online}
            />

            <View style={styles.meta}>
              <View style={styles.nameRow}>
                <Typography variant="title" numberOfLines={1}>
                  {chat.name}
                </Typography>
                <Typography variant="caption" color={theme.colors.textMuted}>
                  {chat.time}
                </Typography>
              </View>

              <View style={styles.snippetRow}>
                <Typography
                  variant="bodySmall"
                  color={chat.unreadCount > 0 ? theme.colors.textPrimary : theme.colors.textSecondary}
                  numberOfLines={1}
                  style={styles.snippet}
                >
                  {chat.lastMessage}
                </Typography>
                {chat.unreadCount > 0 && <Badge count={chat.unreadCount} variant="secondary" />}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: 4,
  },
  list: {
    gap: 8,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  meta: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  snippetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  snippet: {
    flex: 1,
    marginRight: 8,
  },
});
