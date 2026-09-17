import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ChatStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { IcebreakerCard } from '@/components/chat/IcebreakerCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';
import { useIcebreakers } from '@/hooks/useMatching';
import { useSendMessage } from '@/hooks/useMessaging';
import { Icebreaker, IcebreakerCategory } from '@/api/types';

type Props = NativeStackScreenProps<ChatStackParamList, 'IcebreakerPicker'>;

const CATEGORIES: { label: string; value: IcebreakerCategory | 'all'; icon: string }[] = [
  { label: 'All Sparks', value: 'all', icon: 'sparkles' },
  { label: 'Gratitude', value: 'gratitude', icon: 'leaf-outline' },
  { label: 'Empathy', value: 'empathy', icon: 'heart-half-outline' },
  { label: 'Curiosity', value: 'curiosity', icon: 'telescope-outline' },
  { label: 'Reflection', value: 'reflection', icon: 'water-outline' },
  { label: 'Presence', value: 'presence', icon: 'eye-outline' },
  { label: 'Growth', value: 'growth', icon: 'trending-up-outline' },
];

const FALLBACK_DECK: Icebreaker[] = [
  {
    id: 'deck-1',
    prompt: "What made you smile or feel lighter today, even for a few seconds?",
    category: 'gratitude',
    emotion_tags: ['joy', 'gratitude'],
    follow_up: 'Did it change how the rest of your day felt?',
  },
  {
    id: 'deck-2',
    prompt: "What's an emotion you've had lately that you haven't put into words yet?",
    category: 'empathy',
    emotion_tags: ['sadness', 'anxiety', 'neutral'],
    follow_up: 'Take your time, no rush to explain.',
  },
  {
    id: 'deck-3',
    prompt: "If you could whisper one reassuring sentence to yourself this morning, what would it be?",
    category: 'reflection',
    emotion_tags: ['anxiety', 'calm'],
  },
  {
    id: 'deck-4',
    prompt: "What is a curious thought or question that has been lingering in your mind?",
    category: 'curiosity',
    emotion_tags: ['joy', 'calm'],
  },
  {
    id: 'deck-5',
    prompt: "Right here, right now — what are three things your senses notice?",
    category: 'presence',
    emotion_tags: ['calm'],
  },
  {
    id: 'deck-6',
    prompt: "What was a challenge recently that revealed a hidden strength in you?",
    category: 'growth',
    emotion_tags: ['gratitude', 'joy'],
  },
];

export const IcebreakerPickerModal: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { conversationId, emotion } = route.params;
  const [selectedCategory, setSelectedCategory] = useState<IcebreakerCategory | 'all'>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: apiIcebreakers, isLoading, refetch } = useIcebreakers(emotion);
  const sendMutation = useSendMessage(conversationId);

  const icebreakers: Icebreaker[] = useMemo(() => {
    if (apiIcebreakers && apiIcebreakers.length > 0) return apiIcebreakers;
    return FALLBACK_DECK;
  }, [apiIcebreakers]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'all') return icebreakers;
    return icebreakers.filter((item) => item.category === selectedCategory);
  }, [icebreakers, selectedCategory]);

  const handleSelectIcebreaker = useCallback(
    (ice: Icebreaker) => {
      setSelectedId(ice.id);
      sendMutation.mutate(
        {
          content: ice.prompt,
          message_type: 'icebreaker',
          icebreaker_id: ice.id,
          emotion_tag: emotion,
        },
        {
          onSettled: () => {
            navigation.goBack();
          },
        },
      );
    },
    [sendMutation, emotion, navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Icebreaker }) => (
      <IcebreakerCard
        icebreaker={item}
        isSelected={selectedId === item.id}
        onSelect={handleSelectIcebreaker}
      />
    ),
    [selectedId, handleSelectIcebreaker],
  );

  const keyExtractor = useCallback((item: Icebreaker) => item.id, []);

  return (
    <ScreenWrapper style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={styles.titleCol}>
          <Typography variant="h2" weight="bold">
            Empathetic Sparks
          </Typography>
          <Typography variant="caption" color={colors.textSecondary}>
            Thoughtful prompts to initiate heartfelt dialogues
          </Typography>
        </View>
        <IconButton
          icon={<Ionicons name="close" size={22} color={colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
      </View>

      {/* Category Pills */}
      <View style={[styles.categoryBar, { borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.catChip,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  isActive && styles.catChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={12}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                />
                <Typography
                  variant="caption"
                  weight={isActive ? 'bold' : 'medium'}
                  color={isActive ? '#FFFFFF' : colors.textSecondary}
                >
                  {cat.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            emoji="✨"
            title="No Sparks in this Category"
            description="Try selecting another spark category or clear filters to view all prompts."
            actionTitle="Show All Sparks"
            onAction={() => setSelectedCategory('all')}
          />
        }
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
  },
  titleCol: {
    flex: 1,
  },
  categoryBar: {
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    borderWidth: 1,
    gap: 4,
  },
  catChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  list: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  separator: {
    height: 10,
  },
});
