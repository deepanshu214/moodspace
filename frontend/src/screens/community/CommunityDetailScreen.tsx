import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { EmptyState } from '@/components/common/EmptyState';
import { CommunityMoodGauge } from '@/components/community/CommunityMoodGauge';
import { CommunityPostCard } from '@/components/community/CommunityPostCard';
import { useCommunityPosts, useJoinCommunity, useLeaveCommunity } from '@/hooks/useCommunity';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunityDetail'>;

interface FallbackPost {
  id: string;
  authorName: string;
  authorAvatar?: string | null;
  content: string;
  emotion: string;
  isAnonymous: boolean;
  hasContentWarning: boolean;
  isPinned: boolean;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
  postType: string;
}

const FALLBACK_POSTS: FallbackPost[] = [
  {
    id: 'cp-guideline',
    authorName: 'Sanctuary Guardian',
    authorAvatar: null,
    content: 'Welcome to this circle. Here, vulnerability is strength. Unsolicited advice is discouraged; compassionate presence and heartfelt echoes are celebrated. Please respect every soul walking this path.',
    emotion: 'calm',
    isAnonymous: false,
    hasContentWarning: false,
    isPinned: true,
    likesCount: 148,
    commentsCount: 23,
    timestamp: 'Pinned Guideline',
    postType: 'guideline',
  },
  {
    id: 'cp-1',
    authorName: 'Aura Wanderer',
    authorAvatar: null,
    content: 'Today I sat in silence by the harbor for thirty minutes without touching my phone. For the first time in months, the background static in my mind subsided into stillness.',
    emotion: 'calm',
    isAnonymous: false,
    hasContentWarning: false,
    isPinned: false,
    likesCount: 34,
    commentsCount: 8,
    timestamp: '2h ago',
    postType: 'reflection',
  },
  {
    id: 'cp-2',
    authorName: 'Cloaked Soul',
    authorAvatar: null,
    content: 'Struggling heavily with imposter syndrome after my recent career shift. Feeling like everyone else has the blueprint while I am pretending.',
    emotion: 'anxiety',
    isAnonymous: true,
    hasContentWarning: true,
    isPinned: false,
    likesCount: 42,
    commentsCount: 15,
    timestamp: '5h ago',
    postType: 'reflection',
  },
  {
    id: 'cp-3',
    authorName: 'Maya Thorne',
    authorAvatar: null,
    content: 'Finished reading a book on grief and rebuilding after sudden loss. If anyone needs an empathetic listening ear today, my presence is open to you.',
    emotion: 'vulnerable',
    isAnonymous: false,
    hasContentWarning: false,
    isPinned: false,
    likesCount: 57,
    commentsCount: 19,
    timestamp: '8h ago',
    postType: 'discussion',
  },
];

const POST_FILTER_TABS = ['All Echoes', 'Reflections', 'Discussions', 'Wins'];

export const CommunityDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { communityId, communityName, category = 'Mindfulness', dominantEmotion = 'calm' } = route.params;

  const [isJoined, setIsJoined] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('All Echoes');
  const [guidelinesExpanded, setGuidelinesExpanded] = useState(false);

  const { data: apiPosts, isLoading, refetch, isRefetching } = useCommunityPosts(communityId);
  const { mutate: joinMutation } = useJoinCommunity();
  const { mutate: leaveMutation } = useLeaveCommunity();

  const handleToggleJoin = () => {
    if (isJoined) {
      setIsJoined(false);
      leaveMutation(communityId);
    } else {
      setIsJoined(true);
      joinMutation(communityId);
    }
  };

  const emotionConfig = theme.getEmotionConfig(dominantEmotion);

  const allPosts: FallbackPost[] = useMemo(() => {
    if (apiPosts && apiPosts.length > 0) {
      return apiPosts.map((p) => ({
        id: p.id,
        authorName: p.is_anonymous ? 'Cloaked Soul' : 'Circle Seeker',
        authorAvatar: null,
        content: p.content,
        emotion: dominantEmotion,
        isAnonymous: p.is_anonymous ?? false,
        hasContentWarning: p.has_content_warning ?? false,
        isPinned: p.is_pinned ?? false,
        likesCount: p.reaction_count || 0,
        commentsCount: p.comment_count || 0,
        timestamp: 'Recently',
        postType: p.post_type || 'reflection',
      }));
    }
    return FALLBACK_POSTS;
  }, [apiPosts, dominantEmotion]);

  const filteredPosts = useMemo(() => {
    if (selectedFilter === 'All Echoes') return allPosts;
    if (selectedFilter === 'Reflections') {
      return allPosts.filter((p) => p.postType === 'reflection' || p.isPinned);
    }
    if (selectedFilter === 'Discussions') {
      return allPosts.filter((p) => p.postType === 'discussion' || p.isPinned);
    }
    if (selectedFilter === 'Wins') {
      return allPosts.filter((p) => p.postType === 'win' || p.isPinned);
    }
    return allPosts;
  }, [allPosts, selectedFilter]);

  return (
    <ScreenWrapper style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <Typography variant="body" weight="bold" color={colors.textPrimary} numberOfLines={1}>
            {communityName}
          </Typography>
          <Typography variant="caption" color={emotionConfig.primary}>
            {category} Sanctuary
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleToggleJoin}
          style={[
            styles.joinToggleBtn,
            isJoined ? styles.joinedBtn : styles.unjoinedBtn,
          ]}
        >
          <Typography
            variant="caption"
            weight="bold"
            color={isJoined ? colors.textMuted : '#FFFFFF'}
          >
            {isJoined ? 'Joined' : 'Join'}
          </Typography>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primaryLight}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerSection}>
            {/* Group Atmosphere Gauge Banner */}
            <CommunityMoodGauge
              dominantEmotion={dominantEmotion}
              resonanceScore={92}
              style={styles.gaugeBanner}
            />

            {/* Collapsible Safe Space Guidelines */}
            <View style={styles.guidelinesCard}>
              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setGuidelinesExpanded((prev) => !prev)}
                style={styles.guidelinesHeader}
              >
                <View style={styles.guidelinesTitleRow}>
                  <Ionicons name="shield-checkmark" size={16} color="#A29BFE" />
                  <Typography variant="bodySmall" weight="bold" color={colors.textPrimary} style={styles.guidelinesTitleText}>
                    Sanctuary Safe Space Charter
                  </Typography>
                </View>
                <Ionicons
                  name={guidelinesExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={colors.textMuted}
                />
              </TouchableOpacity>

              {guidelinesExpanded && (
                <View style={styles.guidelinesBody}>
                  <Typography variant="caption" color={colors.textSecondary} style={styles.guidelineRow}>
                    🕊️ Speak your authentic truth without fear of ridicule or unsolicited advice.
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary} style={styles.guidelineRow}>
                    🛡️ Shield sensitive trauma or distress with the Content Warning option.
                  </Typography>
                  <Typography variant="caption" color={colors.textSecondary} style={styles.guidelineRow}>
                    🤍 Offer silent empathy and resonant echoes to uphold communal grounding.
                  </Typography>
                </View>
              )}
            </View>

            {/* Feed Filter Chips */}
            <View style={styles.filtersRow}>
              {POST_FILTER_TABS.map((tab) => {
                const isActive = selectedFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.8}
                    onPress={() => setSelectedFilter(tab)}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}
                  >
                    <Typography
                      variant="caption"
                      weight={isActive ? 'bold' : 'medium'}
                      color={isActive ? '#FFFFFF' : colors.textSecondary}
                    >
                      {tab}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <CommunityPostCard
            id={item.id}
            authorName={item.authorName}
            authorAvatar={item.authorAvatar}
            content={item.content}
            emotion={item.emotion}
            isAnonymous={item.isAnonymous}
            hasContentWarning={item.hasContentWarning}
            isPinned={item.isPinned}
            likesCount={item.likesCount}
            commentsCount={item.commentsCount}
            timestamp={item.timestamp}
            style={styles.postCard}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="chatbubbles-outline"
            title="The sanctuary is still quiet"
            description="No reflections found in this filter. Be the first to share an authentic resonance."
            actionTitle="Release First Reflection"
            onAction={() =>
              navigation.navigate('CreateCommunityPost', {
                communityId,
                communityName,
              })
            }
          />
        }
      />

      {/* Floating Action Button: Share Reflection into Circle */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate('CreateCommunityPost', {
            communityId,
            communityName,
          })
        }
        style={styles.floatingFab}
      >
        <Ionicons name="create-outline" size={20} color="#FFFFFF" />
        <Typography variant="bodySmall" weight="bold" color="#FFFFFF" style={styles.fabLabel}>
          Share Reflection
        </Typography>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    padding: 8,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitleWrap: {
    flex: 1,
    marginHorizontal: 12,
  },
  joinToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radius.round,
  },
  joinedBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  unjoinedBtn: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.glow(theme.colors.primary, 0.3),
  },
  headerSection: {
    marginBottom: 16,
  },
  gaugeBanner: {
    marginBottom: 14,
  },
  guidelinesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 14,
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  guidelinesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  guidelinesTitleText: {
    marginLeft: 8,
  },
  guidelinesBody: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  guidelineRow: {
    lineHeight: 18,
    marginBottom: 6,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTabActive: {
    backgroundColor: theme.colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 90,
  },
  postCard: {
    marginBottom: 14,
  },
  floatingFab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: theme.radius.round,
    ...theme.shadows.glow(theme.colors.primary, 0.4),
  },
  fabLabel: {
    marginLeft: 6,
  },
});
