import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  StatusBar,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { EmptyState } from '@/components/common/EmptyState';
import { CommunityCard } from '@/components/community/CommunityCard';
import { useCommunities } from '@/hooks/useCommunity';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunityList'>;

const CATEGORIES = [
  'All',
  'Mindfulness',
  'Vulnerability',
  'Anxiety Support',
  'Healing & Grief',
  'Joy & Wins',
  'Solitude',
  'Sleep & Dreams',
];

interface FallbackCircle {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  dominant_emotion: string;
  privacy: string;
  is_joined?: boolean;
}

const FALLBACK_CIRCLES: FallbackCircle[] = [
  {
    id: 'c-1',
    name: 'Mindful Solitude Sanctuary',
    description: 'A gentle space for introverts, deep thinkers, and quiet souls seeking grounded stillness without performance pressure.',
    category: 'Mindfulness',
    member_count: 342,
    dominant_emotion: 'calm',
    privacy: 'public',
    is_joined: true,
  },
  {
    id: 'c-2',
    name: 'Night Owls & Lucid Dreams',
    description: 'Midnight reflections, twilight thoughts, insomnia solidarity, and processing what emerges after midnight.',
    category: 'Sleep & Dreams',
    member_count: 218,
    dominant_emotion: 'melancholy',
    privacy: 'public',
    is_joined: false,
  },
  {
    id: 'c-3',
    name: 'Unfiltered Vulnerability Haven',
    description: 'Safe harbor to untangle heavy heartbeats, confess what hurts, and discover you were never broken or alone.',
    category: 'Vulnerability',
    member_count: 512,
    dominant_emotion: 'vulnerable',
    privacy: 'public',
    is_joined: true,
  },
  {
    id: 'c-4',
    name: 'Gentle Anxiety Anchors',
    description: 'Grounding techniques, 4-7-8 breathing check-ins, panic support, and soft reminders that this wave will pass.',
    category: 'Anxiety Support',
    member_count: 489,
    dominant_emotion: 'anxiety',
    privacy: 'public',
    is_joined: false,
  },
  {
    id: 'c-5',
    name: 'Radiant Tiny Triumphs',
    description: 'Celebrating the small miracles: getting out of bed, drinking water, smiling back at the morning sun.',
    category: 'Joy & Wins',
    member_count: 670,
    dominant_emotion: 'joy',
    privacy: 'public',
    is_joined: false,
  },
];

export const CommunityListScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: apiCommunities, isLoading, refetch, isRefetching } = useCommunities();

  const allCircles = useMemo(() => {
    if (apiCommunities && apiCommunities.length > 0) {
      return apiCommunities.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        category: c.category || 'Mindfulness',
        member_count: c.member_count || 1,
        dominant_emotion: 'calm',
        privacy: c.privacy || 'public',
        is_joined: false,
      }));
    }
    return FALLBACK_CIRCLES;
  }, [apiCommunities]);

  const filteredCircles = useMemo(() => {
    return allCircles.filter((circle) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        circle.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        searchQuery.trim() === '' ||
        circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        circle.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allCircles, selectedCategory, searchQuery]);

  return (
    <ScreenWrapper style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.titleColumn}>
          <View style={styles.headerBadge}>
            <Ionicons name="people" size={14} color={theme.colors.primaryLight} />
            <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.badgeText}>
              Communities
            </Typography>
          </View>
          <Typography variant="h2" weight="bold" color={theme.colors.textPrimary}>
            Groups & Circles
          </Typography>
          <Typography variant="bodySmall" color={theme.colors.textMuted}>
            Join spaces to talk, share feelings, and support each other
          </Typography>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate('CreateCommunity')}
          style={styles.createBtn}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Typography variant="caption" weight="bold" color="#FFFFFF" style={styles.createBtnText}>
            New Group
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search groups by name or topic..."
          placeholderTextColor={theme.colors.textMuted}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills Horizon */}
      <View style={styles.categoriesWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesList}
          renderItem={({ item }) => {
            const isSelected = selectedCategory === item;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                ]}
              >
                <Typography
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? '#FFFFFF' : theme.colors.textSecondary}
                >
                  {item}
                </Typography>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Circles Feed List */}
      <FlatList
        data={filteredCircles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={theme.colors.primaryLight}
          />
        }
        renderItem={({ item }) => (
          <CommunityCard
            id={item.id}
            name={item.name}
            description={item.description}
            category={item.category}
            memberCount={item.member_count}
            dominantEmotion={item.dominant_emotion}
            privacy={item.privacy}
            isJoined={item.is_joined}
            onPress={() =>
              navigation.navigate('CommunityDetail', {
                communityId: item.id,
                communityName: item.name,
                category: item.category,
                dominantEmotion: item.dominant_emotion,
              })
            }
            style={styles.cardItem}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            iconName="people-outline"
            title="No sanctuaries found"
            description={
              searchQuery
                ? `No circles matched "${searchQuery}". Create one to bring this community together!`
                : 'No communities available in this category yet. Be the founding beacon.'
            }
            actionTitle="Form This Circle"
            onAction={() => navigation.navigate('CreateCommunity')}
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleColumn: {
    flex: 1,
    marginRight: 12,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  badgeText: {
    marginLeft: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
    ...theme.shadows.glow(theme.colors.primary, 0.3),
  },
  createBtnText: {
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: theme.radius.lg,
    paddingHorizontal: 14,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginBottom: 12,
  },
  categoriesList: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryPill: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
    ...theme.shadows.glow(theme.colors.primary, 0.3),
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardItem: {
    marginBottom: 14,
  },
});
