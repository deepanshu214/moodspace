import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import {
  Typography,
  Button,
  IconButton,
  Input,
  Card,
  Avatar,
  Badge,
  Chip,
  Divider,
  Loader,
  Skeleton,
  SkeletonCard,
  EmptyState,
  Toast,
  Modal,
  ScreenWrapper,
} from '../components/common';
import {
  MoodBubble,
  MoodTag,
  BubbleDetailCard,
  FloatingActionButton,
} from '../components/mood';
import {
  AuraDisplay,
  CommentCard,
  NotificationTile,
  RequestCard,
} from '../components/social';
import { Ionicons } from '@expo/vector-icons';

export const DesignSystemShowcase: React.FC = () => {
  const { colors } = useTheme();
  const [inputText, setInputText] = useState('');
  const [selectedChip, setSelectedChip] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(14);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Toast Notification */}
      <Toast
        visible={showToast}
        type="success"
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />

      {/* Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.brandRow}>
          <Typography variant="display" color={colors.primaryLight} weight="heavy">
            MoodSpace
          </Typography>
          <Badge count={6} variant="secondary" />
        </View>
        <Typography variant="body" color={colors.textSecondary}>
          Stage 2: Design System & Emotional Component Library
        </Typography>
      </View>

      <Divider />

      {/* 1. EMOTION PALETTE */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          1. Emotional Color Palette
        </Typography>
        <Typography variant="bodySmall" color={colors.textMuted} style={styles.sectionSub}>
          Dynamic hues representing user mental state & atmosphere
        </Typography>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalRow}>
          {Object.entries(colors.emotions).map(([key, config]) => (
            <View key={key} style={styles.emotionItem}>
              <View
                style={[
                  styles.emotionCircle,
                  { backgroundColor: config.primary, shadowColor: config.primary },
                ]}
              >
                <Typography variant="body">{config.emoji}</Typography>
              </View>
              <Typography variant="caption" weight="medium" color={colors.textSecondary}>
                {config.label}
              </Typography>
            </View>
          ))}
        </ScrollView>
      </View>

      <Divider />

      {/* 2. MOOD BUBBLE & FLOATING MARKERS */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          2. Product: Floating Mood Bubbles
        </Typography>
        <Typography variant="bodySmall" color={colors.textMuted} style={styles.sectionSub}>
          Animated map & feed bubbles pulsing with intensity
        </Typography>

        <View style={styles.bubblesRow}>
          <MoodBubble
            emotion="joy"
            intensity={8}
            authorName="Joyful"
            size="sm"
            onPress={() => triggerToast('Tapped Joy bubble')}
          />
          <MoodBubble
            emotion="calm"
            intensity={6}
            authorName="Serene"
            size="md"
            onPress={() => triggerToast('Tapped Calm bubble')}
          />
          <MoodBubble
            emotion="anxiety"
            intensity={9}
            authorName="Overwhelmed"
            size="lg"
            onPress={() => triggerToast('Tapped Anxiety bubble')}
          />
          <MoodBubble
            emotion="love"
            intensity={10}
            authorName="Warmth"
            size="md"
            onPress={() => triggerToast('Tapped Love bubble')}
          />
        </View>
      </View>

      <Divider />

      {/* 3. MOOD TAGS & CHIPS */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          3. Mood Tags & Filter Chips
        </Typography>
        <View style={styles.tagsWrap}>
          <MoodTag emotion="joy" secondaryEmotion="Grateful" intensity={8} />
          <MoodTag emotion="calm" intensity={7} />
          <MoodTag emotion="anxiety" secondaryEmotion="Restless" intensity={9} />
          <MoodTag emotion="sadness" intensity={5} />
        </View>

        <View style={[styles.tagsWrap, { marginTop: 12 }]}>
          {['All', 'Friends Only', 'Near Me', 'Popular'].map((filter) => (
            <Chip
              key={filter}
              label={filter}
              selected={selectedChip === filter}
              onPress={() => setSelectedChip(filter)}
            />
          ))}
        </View>
      </View>

      <Divider />

      {/* 4. BUBBLE DETAIL CARD */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          4. Bubble Detail Card
        </Typography>
        <Typography variant="bodySmall" color={colors.textMuted} style={styles.sectionSub}>
          Deep emotional post presentation on feed or map bottom sheet
        </Typography>

        <BubbleDetailCard
          id="bubble-1"
          authorName="Elena Rostova"
          auraScore={340}
          emotion="calm"
          secondaryEmotion="Peaceful"
          intensity={7}
          locationCity="San Francisco"
          weatherCondition="Clear"
          weatherTemp={19}
          timestamp="24m ago"
          content="Watching the fog roll over the hills this morning made me realize that some days just require breathing slowly and letting thoughts pass."
          likesCount={likeCount}
          isLiked={liked}
          commentsCount={5}
          onLikePress={() => {
            setLiked(!liked);
            setLikeCount(liked ? likeCount - 1 : likeCount + 1);
            triggerToast(liked ? 'Support removed' : '💜 Sent emotional support!');
          }}
          onCommentPress={() => triggerToast('Opening comments...')}
          onReportPress={() => triggerToast('Options opened')}
        />
      </View>

      <Divider />

      {/* 5. AURA & REPUTATION DISPLAY */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          5. Aura & Emotional Standing
        </Typography>
        <View style={{ gap: 12, marginTop: 8 }}>
          <AuraDisplay score={720} variant="card" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <AuraDisplay score={1250} variant="badge" />
            <AuraDisplay score={340} variant="compact" />
          </View>
        </View>
      </View>

      <Divider />

      {/* 6. SOCIAL: COMMENTS & NOTIFICATIONS & REQUESTS */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          6. Social & Interaction Components
        </Typography>

        {/* Comment Card */}
        <Card variant="flat" style={{ marginBottom: 16 }}>
          <CommentCard
            id="comment-1"
            authorName="Marcus Aurel"
            auraScore={512}
            timestamp="12m ago"
            content="Thank you for sharing this. Had a rough start today, and your reflection brought a warm smile."
            likesCount={3}
            onLikePress={() => triggerToast('Liked comment')}
            onReplyPress={() => triggerToast('Replying to comment')}
          />
        </Card>

        {/* Notification Tile */}
        <NotificationTile
          id="notif-1"
          type="match"
          actorName="Sarah Chen"
          message="shares a similar emotional reflection with you today in Calm & Reflective."
          timestamp="10m ago"
          isRead={false}
          onPress={() => triggerToast('Opened mood match notification')}
        />
        <NotificationTile
          id="notif-2"
          type="like"
          actorName="Alex Miller"
          message="sent empathy and resonated with your mood bubble."
          timestamp="1h ago"
          isRead={true}
          onPress={() => triggerToast('Opened like notification')}
        />

        {/* Request Card */}
        <View style={{ marginTop: 12 }}>
          <RequestCard
            id="req-1"
            requesterName="Kai Takahashi"
            bio="Navigating quiet paths & daily meditations"
            mutualCount={4}
            timestamp="Yesterday"
            onAccept={() => triggerToast('Connection request accepted! 🤝')}
            onDecline={() => triggerToast('Connection request declined.')}
          />
        </View>
      </View>

      <Divider />

      {/* 7. FORM & INPUTS */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          7. Form Inputs & Interactive Buttons
        </Typography>

        <Input
          label="Your Emotional Reflection"
          placeholder="How are you feeling in this moment?"
          value={inputText}
          onChangeText={setInputText}
          helperText="Your notes are end-to-end encrypted"
          leftIcon={<Ionicons name="sparkles" size={18} color={colors.primaryLight} />}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          isPassword
          defaultValue="secretpassword"
        />

        <View style={styles.buttonsWrap}>
          <Button
            title="Primary Action"
            variant="primary"
            onPress={() => setIsModalOpen(true)}
            leftIcon={<Ionicons name="open-outline" size={18} color="#FFFFFF" />}
          />
          <Button
            title="Secondary"
            variant="secondary"
            onPress={() => triggerToast('Secondary button clicked')}
          />
          <Button
            title="Outline"
            variant="outline"
            onPress={() => triggerToast('Outline button clicked')}
          />
          <Button
            title="Danger"
            variant="danger"
            onPress={() => triggerToast('Danger button clicked')}
          />
        </View>
      </View>

      <Divider />

      {/* 8. SKELETON & EMPTY STATE */}
      <View style={styles.section}>
        <Typography variant="h3" weight="bold" color={colors.textPrimary}>
          8. Loaders & Empty States
        </Typography>
        <SkeletonCard style={{ marginTop: 8 }} />

        <EmptyState
          emoji="🌌"
          title="No Nearby Bubbles"
          description="Be the first soul to light up this coordinate with your emotional check-in."
          actionTitle="Create First Bubble"
          onAction={() => triggerToast('Create bubble flow triggered!')}
        />
      </View>

      {/* Modal Demo */}
      <Modal
        visible={isModalOpen}
        title="Check-In Privacy"
        onClose={() => setIsModalOpen(false)}
        footer={
          <Button
            title="Got it"
            variant="primary"
            fullWidth
            onPress={() => setIsModalOpen(false)}
          />
        }
      >
        <Typography variant="body" color={colors.textSecondary}>
          MoodSpace protects your vulnerable emotional moments. You can choose to post
          publicly, with mutual connections only, or completely incognito.
        </Typography>
      </Modal>

      {/* Floating Action Button Demo */}
      <FloatingActionButton
        onPress={() => triggerToast('FAB Pressed: Quick Check-in')}
        label="Log Mood"
        iconName="heart"
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  headerBanner: {
    paddingVertical: theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  sectionSub: {
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  horizontalRow: {
    flexDirection: 'row',
  },
  emotionItem: {
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  emotionCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    ...theme.shadows.subtle,
  },
  bubblesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    paddingVertical: theme.spacing.md,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: theme.spacing.md,
  },
});
