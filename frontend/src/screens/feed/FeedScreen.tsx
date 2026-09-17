import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { FeedCard } from '@/components/social/FeedCard';
import { EmptyState } from '@/components/common/EmptyState';
import { useFeed } from '@/hooks/useFeed';
import { Ionicons } from '@expo/vector-icons';

interface FeedScreenProps {
  navigation: any;
}

const EMOTION_FILTERS = [
  { id: null, label: 'All Resonance', emoji: '🌌' },
  { id: 'joy', label: 'Joy', emoji: '✨' },
  { id: 'calm', label: 'Calm', emoji: '🌊' },
  { id: 'anxiety', label: 'Anxiety', emoji: '⚡' },
  { id: 'love', label: 'Love', emoji: '💖' },
  { id: 'sadness', label: 'Sadness', emoji: '🌧️' },
];

interface FeedPostItem {
  id: string;
  authorId?: string;
  authorName: string;
  auraScore?: number;
  emotion: string;
  secondaryEmotion?: string;
  intensity: number;
  content: string;
  locationCity?: string;
  weatherCondition?: string;
  weatherTemp?: number;
  timestamp: string;
  reactionsCount: number;
  commentsCount: number;
  isAnonymous?: boolean;
}

const DEFAULT_POSTS: FeedPostItem[] = [
  {
    id: 'f-1',
    authorId: 'u-elena',
    authorName: 'Elena Rostova',
    auraScore: 420,
    emotion: 'calm',
    secondaryEmotion: 'Grateful',
    intensity: 7,
    content: 'Listening to the rain outside while reflecting on how much growth happened this past year. Grateful for this gentle moment.',
    locationCity: 'San Francisco',
    weatherCondition: 'Misty Sunrise',
    weatherTemp: 17,
    timestamp: '15m ago',
    reactionsCount: 28,
    commentsCount: 6,
  },
  {
    id: 'f-2',
    authorId: 'u-marcus',
    authorName: 'Marcus Aurel',
    auraScore: 680,
    emotion: 'joy',
    secondaryEmotion: 'Euphoric',
    intensity: 9,
    content: 'Just finished our first community project! The collective energy is electrifying. Thank you to everyone who showed up.',
    locationCity: 'Oakland',
    weatherCondition: 'Clear Starlight',
    weatherTemp: 21,
    timestamp: '42m ago',
    reactionsCount: 54,
    commentsCount: 12,
  },
  {
    id: 'f-3',
    authorId: 'u-anon',
    authorName: 'Anonymous Spirit',
    auraScore: 190,
    emotion: 'anxiety',
    secondaryEmotion: 'Restless',
    intensity: 8,
    content: 'Big transition coming up next week. Heart has been fluttering all day. Writing this here to release the weight.',
    locationCity: 'Mission District',
    weatherCondition: 'Breezy Dusk',
    weatherTemp: 16,
    timestamp: '1h ago',
    reactionsCount: 37,
    commentsCount: 9,
    isAnonymous: true,
  },
  {
    id: 'f-4',
    authorId: 'u-sarah',
    authorName: 'Sarah Lin',
    auraScore: 540,
    emotion: 'love',
    secondaryEmotion: 'Affectionate',
    intensity: 10,
    content: 'Reunited with my childhood friend after four years apart. Love knows no distance or silence. Hug your people today.',
    locationCity: 'Berkeley',
    weatherCondition: 'Warm Sunset',
    weatherTemp: 22,
    timestamp: '2h ago',
    reactionsCount: 89,
    commentsCount: 16,
  },
];

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [feedMode, setFeedMode] = useState<'resonant' | 'chronological'>('resonant');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const { data: feedData, isLoading, refetch, isRefetching } = useFeed();

  // Normalize API data or fallback
  const posts: FeedPostItem[] = useMemo(() => {
    if (feedData?.items && feedData.items.length > 0) {
      return feedData.items.map((item, idx) => ({
        id: item.id || `api-feed-${idx}`,
        authorId: item.user_id,
        authorName: item.is_incognito ? 'Anonymous Spirit' : (item.user_id || 'Seeker'),
        auraScore: 300,
        emotion: item.primary_emotion || 'calm',
        secondaryEmotion: item.secondary_emotion,
        intensity: item.intensity || 7,
        content: item.notes || '',
        locationCity: item.city || 'Nearby',
        weatherCondition: item.weather_condition,
        weatherTemp: item.weather_temp,
        timestamp: 'Recent',
        reactionsCount: item.reactions_count || 0,
        commentsCount: item.comments_count || 0,
        isAnonymous: item.is_incognito,
      }));
    }
    return DEFAULT_POSTS;
  }, [feedData]);

  // Apply filters
  const filteredPosts = useMemo(() => {
    let result = posts;
    if (selectedFilter) {
      result = result.filter(
        (p) => p.emotion.toLowerCase() === selectedFilter.toLowerCase()
      );
    }
    if (feedMode === 'resonant') {
      // Sort highest intensity & reactions first
      result = [...result].sort((a, b) => b.intensity + b.reactionsCount - (a.intensity + a.reactionsCount));
    }
    return result;
  }, [posts, selectedFilter, feedMode]);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleCol}>
          <Typography variant="h3" weight="bold">
            Emotional Stream
          </Typography>
          <Typography variant="caption" color={colors.textMuted}>
            Echoes and resonances from the collective
          </Typography>
        </View>

        {/* View Switcher: Resonant vs Chronological */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFeedMode('resonant')}
            style={[styles.modeBtn, feedMode === 'resonant' && styles.modeBtnActive]}
          >
            <Ionicons
              name="sparkles"
              size={13}
              color={feedMode === 'resonant' ? '#FFFFFF' : colors.textMuted}
            />
            <Typography
              variant="caption"
              weight="bold"
              color={feedMode === 'resonant' ? '#FFFFFF' : colors.textMuted}
            >
              Resonant
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setFeedMode('chronological')}
            style={[styles.modeBtn, feedMode === 'chronological' && styles.modeBtnActive]}
          >
            <Ionicons
              name="time-outline"
              size={13}
              color={feedMode === 'chronological' ? '#FFFFFF' : colors.textMuted}
            />
            <Typography
              variant="caption"
              weight="bold"
              color={feedMode === 'chronological' ? '#FFFFFF' : colors.textMuted}
            >
              Latest
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Emotion Filter Carousel */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {EMOTION_FILTERS.map((item) => {
            const isSelected = selectedFilter === item.id;
            return (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={() => setSelectedFilter(item.id)}
                style={[
                  styles.filterPill,
                  isSelected && styles.filterPillActive,
                ]}
              >
                <Typography variant="caption">{item.emoji}</Typography>
                <Typography
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#FFFFFF' : colors.textSecondary}
                >
                  {item.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Feed FlashList for 60fps virtualization */}
      <FlashList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.feedScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primaryLight}
          />
        }
        renderItem={({ item: post }) => (
          <FeedCard
            key={post.id}
            id={post.id}
            authorId={post.authorId}
            authorName={post.authorName}
            auraScore={post.auraScore}
            emotion={post.emotion}
            secondaryEmotion={post.secondaryEmotion}
            intensity={post.intensity}
            content={post.content}
            locationCity={post.locationCity}
            weatherCondition={post.weatherCondition}
            weatherTemp={post.weatherTemp}
            timestamp={post.timestamp}
            reactionsCount={post.reactionsCount}
            commentsCount={post.commentsCount}
            isAnonymous={post.isAnonymous}
            onPress={() => {
              navigation.navigate('BubbleDetails', {
                bubbleId: post.id,
                emotion: post.emotion,
                authorName: post.authorName,
              });
            }}
            onAuthorPress={() => {
              if (post.authorId) {
                navigation.navigate('UserProfile', {
                  userId: post.authorId,
                  username: post.authorName,
                });
              }
            }}
            onCommentPress={() => {
              navigation.navigate('BubbleDetails', {
                bubbleId: post.id,
                emotion: post.emotion,
                authorName: post.authorName,
              });
            }}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            emoji="🍃"
            title="A Quiet Moment"
            description="No reflections found for this emotion filter. Be the first to share."
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#07080D',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  headerTitleCol: {},
  modeSwitcher: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: theme.radius.pill,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  modeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
  },
  modeBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  filterWrapper: {
    paddingVertical: 6,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterPillActive: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
  },
  feedScroll: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
});
