import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { emotionInk } from '@/theme/colors';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { BubbleDetailCard } from '@/components/mood/BubbleDetailCard';
import { CommentCard } from '@/components/social/CommentCard';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParamList, 'BubbleDetails'>;

export const BubbleDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const {
    bubbleId = 'bubble-main',
    emotion = 'calm',
    authorName = 'Elena Rostova',
  } = route.params;

  const [commentText, setCommentText] = useState('');
  const [likesCount, setLikesCount] = useState(24);
  const [isLiked, setIsLiked] = useState(false);

  const [comments, setComments] = useState([
    {
      id: 'c-1',
      author: 'Kai Tanaka',
      aura: 450,
      text: 'Taking deep breaths with you today. Beautiful perspective.',
      time: '18m ago',
      likes: 4,
    },
    {
      id: 'c-2',
      author: 'Marcus Aurel',
      aura: 610,
      text: 'Needed this reminder so badly. Grateful you shared this quiet space.',
      time: '5m ago',
      likes: 6,
    },
  ]);

  const emotionConfig = theme.getEmotionConfig(emotion);

  const handleToggleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

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
      {/* Dynamic Emotion Background Glow */}
      <View
        style={[
          styles.ambientAura,
          { backgroundColor: emotionConfig.glow },
        ]}
      />

      {/* Header Bar */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTitleBox}>
          <Typography variant="title" weight="bold">
            Emotional Resonance
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Echoing across space
          </Typography>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* Primary Detail Card */}
      <BubbleDetailCard
        id={bubbleId}
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
        likesCount={likesCount}
        isLiked={isLiked}
        onLikePress={handleToggleLike}
        commentsCount={comments.length}
      />

      {/* Supportive Echoes Thread */}
      <View style={styles.commentsSection}>
        <View style={styles.echoesHeaderRow}>
          <Typography variant="title" weight="bold">
            Supportive Echoes ({comments.length})
          </Typography>
          <Typography variant="caption" color={colors.accentInk}>
            Safe & Empathetic
          </Typography>
        </View>

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
          placeholderTextColor={colors.textMuted}
          value={commentText}
          onChangeText={setCommentText}
          style={[styles.commentInput, { color: colors.textPrimary }]}
        />
        <TouchableOpacity
          onPress={handleSendComment}
          activeOpacity={0.7}
          disabled={!commentText.trim()}
          style={[
            styles.sendBtn,
            !commentText.trim() && { opacity: 0.4 },
          ]}
        >
          <Ionicons name="arrow-up-circle" size={34} color={emotionInk(emotionConfig, isDark)} />
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
  ambientAura: {
    position: 'absolute',
    top: -120,
    left: -60,
    right: -60,
    height: 380,
    borderRadius: 200,
    opacity: 0.15,
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
  commentsSection: {
    marginTop: theme.spacing.xl,
  },
  echoesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 30, 36, 0.9)',
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingLeft: theme.spacing.lg,
    paddingRight: 6,
    paddingVertical: 4,
    marginTop: theme.spacing.xl,
    ...theme.shadows.card,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
  },
  sendBtn: {
    padding: 2,
  },
});
