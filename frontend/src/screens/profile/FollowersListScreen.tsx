import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { FollowUserTile } from '@/components/social/FollowUserTile';
import { EmptyState } from '@/components/common/EmptyState';
import { useFollowers, useFollowing } from '@/hooks/useSocial';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'FollowersList'>;

const MOCK_USERS = [
  {
    id: 'u-1',
    name: 'Kai Takahashi',
    bio: 'Navigating quiet paths & daily meditations.',
    aura: 450,
    following: true,
  },
  {
    id: 'u-2',
    name: 'Sarah Lin',
    bio: 'Finding light in subtle ordinary moments.',
    aura: 620,
    following: true,
  },
  {
    id: 'u-3',
    name: 'Marcus Aurel',
    bio: 'Stoic reflections and gentle community building.',
    aura: 710,
    following: false,
  },
  {
    id: 'u-4',
    name: 'Maya Lin',
    bio: 'Ambient sound composer & landscape painter.',
    aura: 380,
    following: true,
  },
];

export const FollowersListScreen: React.FC<Props> = ({ route, navigation }) => {
  const { colors } = useTheme();
  const initialType = route.params?.type || 'followers';
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(initialType);

  const { data: followersApi, isLoading: loadingFollowers } = useFollowers();
  const { data: followingApi, isLoading: loadingFollowing } = useFollowing();

  const currentUsers = (activeTab === 'followers' ? followersApi : followingApi) || MOCK_USERS;

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Header Bar */}
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="bold">
          Connections
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      {/* Segmented Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('followers')}
          style={[styles.tabBtn, activeTab === 'followers' && styles.tabBtnActive]}
        >
          <Typography
            variant="bodySmall"
            weight="bold"
            color={activeTab === 'followers' ? '#FFFFFF' : colors.textMuted}
          >
            Followers ({followersApi?.length || 148})
          </Typography>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('following')}
          style={[styles.tabBtn, activeTab === 'following' && styles.tabBtnActive]}
        >
          <Typography
            variant="bodySmall"
            weight="bold"
            color={activeTab === 'following' ? '#FFFFFF' : colors.textMuted}
          >
            Following ({followingApi?.length || 92})
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      {currentUsers.length > 0 ? (
        <View style={styles.list}>
          {currentUsers.map((item: any) => (
            <FollowUserTile
              key={item.id}
              id={item.id}
              name={item.name || item.display_name || 'Traveler'}
              avatarUrl={item.avatarUrl || item.avatar_url}
              bio={item.bio}
              auraScore={item.aura || item.aura_score || 350}
              initialFollowing={item.following ?? true}
              onPress={() => {
                navigation.navigate('UserProfile', {
                  userId: item.id,
                  username: item.name || item.display_name || 'Traveler',
                });
              }}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          emoji="👥"
          title={`No ${activeTab === 'followers' ? 'Followers' : 'Following'} Yet`}
          description="Explore nearby bubbles on the map to discover resonant souls."
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: '#07080D',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.pill,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: theme.radius.pill,
  },
  tabBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  list: {
    gap: 4,
  },
});
