import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>;

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

export const ChatDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { recipientName = 'Soul Explorer', recipientAvatar } = route.params;
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'other',
      text: 'Hey! Saw your mood bubble on the map earlier. How are you holding up?',
      time: '14:15',
    },
    {
      id: 'm-2',
      sender: 'me',
      text: 'Much better now! Took a long walk near the coast.',
      time: '14:18',
    },
    {
      id: 'm-3',
      sender: 'other',
      text: 'That sounds peaceful. Walking near water always resets my anxiety.',
      time: '14:20',
    },
  ]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([
      ...messages,
      {
        id: `m-${Date.now()}`,
        sender: 'me',
        text: inputText.trim(),
        time: 'Just now',
      },
    ]);
    setInputText('');
  };

  return (
    <ScreenWrapper style={styles.container}>
      {/* Chat Header */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />

        <View style={styles.recipientInfo}>
          <Avatar source={recipientAvatar} name={recipientName} size="sm" showPresence isOnline />
          <View style={styles.nameCol}>
            <Typography variant="title" numberOfLines={1}>
              {recipientName}
            </Typography>
            <Typography variant="caption" color={theme.colors.success}>
              Active now
            </Typography>
          </View>
        </View>

        <IconButton
          icon={<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.primaryLight} />}
          variant="ghost"
        />
      </View>

      {/* Messages Feed */}
      <ScrollView
        contentContainerStyle={styles.messagesContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.encryptionNotice}>
          <Ionicons name="lock-closed" size={14} color={theme.colors.textMuted} />
          <Typography variant="caption" color={theme.colors.textMuted} style={styles.noticeText}>
            Messages are end-to-end encrypted. No one else can read them.
          </Typography>
        </View>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          return (
            <View
              key={msg.id}
              style={[
                styles.bubbleWrapper,
                isMe ? styles.bubbleWrapperMe : styles.bubbleWrapperOther,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  isMe ? styles.bubbleMe : styles.bubbleOther,
                ]}
              >
                <Typography
                  variant="body"
                  color={isMe ? '#FFFFFF' : theme.colors.textPrimary}
                >
                  {msg.text}
                </Typography>
                <Typography
                  variant="caption"
                  color={isMe ? 'rgba(255, 255, 255, 0.7)' : theme.colors.textMuted}
                  style={styles.messageTime}
                >
                  {msg.time}
                </Typography>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Message Composer */}
      <View style={styles.composerContainer}>
        <TextInput
          placeholder="Send a supportive message..."
          placeholderTextColor={theme.colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          style={styles.input}
        />
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleSend}
          style={styles.sendButton}
        >
          <Ionicons name="send" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  recipientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: theme.spacing.sm,
  },
  nameCol: {
    marginLeft: theme.spacing.sm,
  },
  messagesContainer: {
    padding: theme.spacing.lg,
    paddingBottom: 20,
  },
  encryptionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  noticeText: {
    marginLeft: 6,
  },
  bubbleWrapper: {
    marginVertical: 4,
    width: '100%',
    flexDirection: 'row',
  },
  bubbleWrapperMe: {
    justifyContent: 'flex-end',
  },
  bubbleWrapperOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.lg,
  },
  bubbleMe: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderBottomLeftRadius: 2,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  composerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    color: theme.colors.textPrimary,
    fontSize: 15,
    fontFamily: theme.typography.fontFamily,
    paddingHorizontal: theme.spacing.md,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
});
