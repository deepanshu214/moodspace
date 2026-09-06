import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { BubbleDetailCard } from '@/components/mood/BubbleDetailCard';
import { CommentCard } from '@/components/social/CommentCard';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'BubbleDetails'>;

export const BubbleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { emotion = 'calm', authorName = 'Elena Rostova' } = route.params;
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: 'Kai T.',
      aura: 450,
      text: 'Taking deep breaths with you today. Beautiful perspective.',
      time: '18m ago',
      likes: 2,
    },
    {
      id: 'c-2',
      author: 'Marcus A.',
      aura: 610,
      text: 'Needed this reminder so badly. Grateful you shared this.',
      time: '5m ago',
      likes: 4,
    },
  ]);

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: `c-${Date.now()}`,
        author: 'You',
        aura: 150,
        text: commentText.trim(),
        time: 'Just now',
        likes: 0,
      },
    ]);
    setCommentText('');
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="semibold">
          Emotional Check-In
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <BubbleDetailCard
        id="bubble-main"
        authorName={authorName}
        auraScore={420}
        emotion={emotion}
        secondaryEmotion="Grateful"
        intensity={8}
        locationCity="San Francisco"
        weatherCondition="Misty Sunrise"
        weatherTemp={18}
        timestamp="Just now"
        content="Listening to the rain outside while reflecting on how much growth happened this past year. Grateful for this gentle moment."
        likesCount={18}
        commentsCount={comments.length}
      />

      <View style={styles.commentsSection}>
        <Typography variant="title" weight="semibold" style={styles.commentsTitle}>
          Supportive Echoes ({comments.length})
        </Typography>

        {comments.map((item) => (
          <CommentCard
            key={item.id}
            id={item.id}
            authorName={item.author}
            auraScore={item.aura}
            content={item.text}
            timestamp={item.time}
            likesCount={item.likes}
          />
        ))}
      </View>

      {/* Comment Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          placeholder="Send an empathetic echo..."
          placeholderTextColor={theme.colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          style={styles.commentInput}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          activeOpacity={0.7}
          style={styles.sendBtn}
        >
          <Ionicons name="arrow-up-circle" size={32} color={theme.colors.primaryLight} />
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  commentsSection: {
    marginTop: theme.spacing.xl,
  },
  commentsTitle: {
    marginBottom: theme.spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingLeft: theme.spacing.lg,
    paddingRight: theme.spacing.xs,
    paddingVertical: 4,
    marginTop: theme.spacing.xl,
  },
  commentInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
  },
  sendBtn: {
    padding: 4,
  },
});
