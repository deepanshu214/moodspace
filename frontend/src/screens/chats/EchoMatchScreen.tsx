import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { EmptyState } from '@/components/common/EmptyState';
import { Skeleton } from '@/components/common/Skeleton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { ResonanceMatchCard } from '@/components/chat/ResonanceMatchCard';
import { Ionicons } from '@expo/vector-icons';
import { useEchoMatches, useDecideEchoMatch } from '@/hooks/useMatching';
import { EchoMatchResponse } from '@/api/types';

type Props = NativeStackScreenProps<ChatStackParamList, 'EchoMatch'>;

const MOCK_ECHO_MATCHES: EchoMatchResponse[] = [
  {
    match_id: 'match-1',
    user_id: 'usr-101',
    display_name: 'Aria Vane',
    avatar_url: null,
    current_emotion: 'calm',
    resonance_score: 95,
    match_reasons: ['shared_emotion', 'location_proximity', 'community_overlap'],
    shared_emotion: 'calm',
    city: 'San Francisco, CA',
    mutual_communities: 2,
    icebreaker: {
      id: 'ib-101',
      prompt: 'What was the single calmest moment in your day so far?',
      category: 'presence',
      emotion_tags: ['calm'],
    },
    is_anonymous: false,
  },
  {
    match_id: 'match-2',
    user_id: 'usr-102',
    display_name: 'Wandering Nomad',
    avatar_url: null,
    current_emotion: 'anxiety',
    resonance_score: 88,
    match_reasons: ['mood_pattern', 'complementary_emotion'],
    shared_emotion: 'anxiety',
    city: 'Seattle, WA',
    mutual_communities: 1,
    icebreaker: {
      id: 'ib-102',
      prompt: 'If you could pause the clock right now for an hour, what would you do?',
      category: 'reflection',
      emotion_tags: ['anxiety', 'calm'],
    },
    is_anonymous: true,
  },
  {
    match_id: 'match-3',
    user_id: 'usr-103',
    display_name: 'Julian Silva',
    avatar_url: null,
    current_emotion: 'gratitude',
    resonance_score: 82,
    match_reasons: ['shared_emotion', 'mood_pattern'],
    shared_emotion: 'gratitude',
    city: 'Brooklyn, NY',
    mutual_communities: 3,
    icebreaker: {
      id: 'ib-103',
      prompt: 'Who was the last person that made you feel truly heard?',
      category: 'gratitude',
      emotion_tags: ['gratitude', 'joy'],
    },
    is_anonymous: false,
  },
];

type FilterType = 'all' | 'high' | 'same_city';

export const EchoMatchScreen: React.FC<Props> = ({ navigation }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [connectingMatchId, setConnectingMatchId] = useState<string | null>(null);

  const { data: apiMatches, isLoading, isRefetching, refetch } = useEchoMatches();
  const decideMutation = useDecideEchoMatch();

  // Combine API or fallback
  const rawMatches: EchoMatchResponse[] = useMemo(() => {
    if (apiMatches && apiMatches.length > 0) return apiMatches;
    return MOCK_ECHO_MATCHES;
  }, [apiMatches]);

  const filteredMatches = useMemo(() => {
    if (filter === 'high') {
      return rawMatches.filter((m) => m.resonance_score >= 85);
    }
    if (filter === 'same_city') {
      return rawMatches.filter((m) => !!m.city);
    }
    return rawMatches;
  }, [rawMatches, filter]);

  const handleConnect = useCallback(
    (match: EchoMatchResponse) => {
      setConnectingMatchId(match.match_id);
      decideMutation.mutate(
        { match_id: match.match_id, decision: 'connect' },
        {
          onSuccess: (res) => {
            setConnectingMatchId(null);
            const targetChatId = res.conversation_id || `conv-${match.user_id}`;
            navigation.navigate('ChatDetail', {
              chatId: targetChatId,
              recipientName: match.is_anonymous ? '🌀 Wandering Spirit' : match.display_name,
              recipientAvatar: match.avatar_url,
              recipientEmotion: match.current_emotion,
              isEchoMatch: true,
            });
          },
          onError: () => {
            setConnectingMatchId(null);
            // Fallback navigation in demo/offline mode
            navigation.navigate('ChatDetail', {
              chatId: `conv-${match.user_id}`,
              recipientName: match.is_anonymous ? '👻 Anonymous Friend' : match.display_name,
              recipientAvatar: match.avatar_url,
              recipientEmotion: match.current_emotion,
              isEchoMatch: true,
            });
          },
        },
      );
    },
    [decideMutation, navigation],
  );

  const handlePass = useCallback(
    (match: EchoMatchResponse) => {
      decideMutation.mutate({ match_id: match.match_id, decision: 'pass' });
    },
    [decideMutation],
  );

  const renderItem = useCallback(
    ({ item }: { item: EchoMatchResponse }) => (
      <ResonanceMatchCard
        match={item}
        onConnect={handleConnect}
        onPass={handlePass}
        isConnecting={connectingMatchId === item.match_id}
      />
    ),
    [handleConnect, handlePass, connectingMatchId],
  );

  const keyExtractor = useCallback((item: EchoMatchResponse) => item.match_id, []);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <View style={styles.headerTitles}>
          <Typography variant="h2" weight="bold">
            1-on-1 Matches
          </Typography>
          <Typography variant="caption" color={theme.colors.textSecondary}>
            Connect with people experiencing similar feelings
          </Typography>
        </View>
        <IconButton
          icon={<Ionicons name="sparkles" size={20} color={theme.colors.secondary} />}
          variant="ghost"
          onPress={() => refetch()}
        />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterChip, filter === 'all' && styles.filterChipActive]}
            onPress={() => setFilter('all')}
          >
            <Typography
              variant="caption"
              weight={filter === 'all' ? 'bold' : 'medium'}
              color={filter === 'all' ? '#FFFFFF' : theme.colors.textSecondary}
            >
              All Matches ({rawMatches.length})
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'high' && styles.filterChipActive]}
            onPress={() => setFilter('high')}
          >
            <Typography
              variant="caption"
              weight={filter === 'high' ? 'bold' : 'medium'}
              color={filter === 'high' ? '#FFFFFF' : theme.colors.textSecondary}
            >
              ⚡ Close Match (≥85%)
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, filter === 'same_city' && styles.filterChipActive]}
            onPress={() => setFilter('same_city')}
          >
            <Typography
              variant="caption"
              weight={filter === 'same_city' ? 'bold' : 'medium'}
              color={filter === 'same_city' ? '#FFFFFF' : theme.colors.textSecondary}
            >
              📍 Nearby Currents
            </Typography>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          {[0, 1].map((i) => (
            <Skeleton
              key={i}
              height={220}
              borderRadius={theme.radius.xl}
              style={styles.skeletonCard}
            />
          ))}
        </View>
      ) : (
        <FlatList
          data={filteredMatches}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              emoji="🌌"
              title="No Active Resonances"
              description="You have explored all matching echoes for this frequency. As the map's atmospheric pulse changes, new connections will emerge."
              actionTitle="Refresh Signals"
              onAction={() => refetch()}
            />
          }
        />
      )}
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
  headerTitles: {
    flex: 1,
    marginLeft: theme.spacing.xs,
  },
  filterBar: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    padding: theme.spacing.lg,
    gap: 16,
  },
  skeletonCard: {
    marginBottom: 16,
  },
});
