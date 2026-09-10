import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { AuraDisplay } from '@/components/social/AuraDisplay';
import { MoodTag } from '@/components/mood/MoodTag';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useUserProfile } from '@/hooks/useAuth';
import { useSendConnection } from '@/hooks/useSocial';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'UserProfile'>;

export const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { userId = 'u-kai', username = 'Kai Takahashi' } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: profile } = useUserProfile(userId);
  const { mutate: sendConnectionRequest, isPending: isConnecting } = useSendConnection();

  const handleFollowToggle = () => {
    if (!isFollowing) {
      sendConnectionRequest({ addressee_id: userId });
      setIsFollowing(true);
    } else {
      setIsFollowing(false);
    }
  };

  const displayName = profile?.display_name || username;
  const bio = profile?.bio || 'Observing evening reflections. Learning to embrace uncertain weather.';
  const auraScore = profile?.aura_score || 480;

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Top Bar Navigation */}
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="bold">
          Explorer Profile
        </Typography>
        <IconButton
          icon={<Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />}
          variant="ghost"
        />
      </View>

      {/* User Header */}
      <View style={styles.profileHeader}>
        <Avatar
          name={displayName}
          source={profile?.avatar_url}
          size="xl"
          emotion="calm"
        />

        <Typography variant="h2" weight="bold" style={styles.name}>
          {displayName}
        </Typography>

        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.bio}>
          {bio}
        </Typography>

        {/* Action Button Row */}
        <View style={styles.btnRow}>
          <Button
            title={isFollowing ? 'Connected' : 'Connect / Follow'}
            variant={isFollowing ? 'outline' : 'primary'}
            loading={isConnecting}
            onPress={handleFollowToggle}
            leftIcon={
              <Ionicons
                name={isFollowing ? 'checkmark' : 'person-add'}
                size={16}
                color={isFollowing ? theme.colors.primaryLight : '#FFFFFF'}
              />
            }
            style={styles.actionBtn}
          />
          <Button
            title="Send Echo"
            variant="secondary"
            onPress={() => {
              (navigation as any).navigate('ChatsTab', {
                screen: 'ChatDetail',
                params: {
                  chatId: `chat-${userId}`,
                  recipientName: displayName,
                  recipientAvatar: profile?.avatar_url,
                },
              });
            }}
            leftIcon={<Ionicons name="chatbubble-outline" size={16} color={theme.colors.textPrimary} />}
            style={styles.actionBtn}
          />
        </View>
      </View>

      {/* Aura Points Display Card */}
      <View style={styles.section}>
        <AuraDisplay score={auraScore} variant="card" />
      </View>

      {/* Public Emotional Footprint */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold" style={styles.sectionTitle}>
          Active Emotional Aura
        </Typography>

        <View style={styles.historyPills}>
          <MoodTag emotion="calm" secondaryEmotion="Reflective" intensity={7} />
          <MoodTag emotion="anxiety" secondaryEmotion="Vulnerable" intensity={6} />
        </View>
      </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  name: {
    marginTop: theme.spacing.md,
    marginBottom: 4,
  },
  bio: {
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.sm,
  },
  actionBtn: {
    minWidth: 140,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  historyPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
