import React from 'react';
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
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'MyProfile'>;

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Header Actions */}
      <View style={styles.topBar}>
        <Typography variant="h3" weight="bold">
          My Aura & Profile
        </Typography>
        <IconButton
          icon={<Ionicons name="settings-outline" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.navigate('Settings')}
        />
      </View>

      {/* Profile Info */}
      <View style={styles.profileHeader}>
        <Avatar
          name={user?.displayName || 'Elena Rostova'}
          size="xl"
          emotion="calm"
        />

        <Typography variant="h2" weight="bold" style={styles.name}>
          {user?.displayName || 'Elena Rostova'}
        </Typography>

        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.bio}>
          {user?.bio || 'Holding space for calm moments, deep ocean walks, and mindful connection.'}
        </Typography>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Typography variant="h3" weight="bold">24</Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>Bubbles</Typography>
          </View>
          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('FollowRequests')}
          >
            <Typography variant="h3" weight="bold">148</Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>Followers</Typography>
          </TouchableOpacity>
          <View style={styles.statBox}>
            <Typography variant="h3" weight="bold">92</Typography>
            <Typography variant="caption" color={theme.colors.textMuted}>Following</Typography>
          </View>
        </View>
      </View>

      {/* Aura Card */}
      <View style={styles.section}>
        <AuraDisplay score={user?.auraScore || 340} variant="card" />
      </View>

      {/* Quick Action Navigation Buttons */}
      <View style={styles.actionsGrid}>
        <Button
          title="Edit Profile"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('EditProfile')}
          leftIcon={<Ionicons name="pencil" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="Follow Requests"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('FollowRequests')}
          leftIcon={<Ionicons name="person-add" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
        <Button
          title="View Requests"
          variant="secondary"
          size="md"
          onPress={() => navigation.navigate('ProfileViewRequests')}
          leftIcon={<Ionicons name="eye" size={16} color={theme.colors.textPrimary} />}
          style={styles.actionBtn}
        />
      </View>

      {/* Mood History Section */}
      <View style={styles.section}>
        <Typography variant="title" weight="bold" style={styles.sectionTitle}>
          Recent Emotional Footprint
        </Typography>

        <View style={styles.historyPills}>
          <MoodTag emotion="calm" secondaryEmotion="Peaceful" intensity={7} />
          <MoodTag emotion="joy" secondaryEmotion="Grateful" intensity={9} />
          <MoodTag emotion="love" secondaryEmotion="Warm" intensity={8} />
        </View>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    paddingBottom: 60,
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
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.xl,
  },
  actionBtn: {
    flex: 1,
    minWidth: 140,
  },
  historyPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
