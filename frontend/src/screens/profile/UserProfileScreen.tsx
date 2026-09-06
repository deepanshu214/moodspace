import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { AuraDisplay } from '@/components/social/AuraDisplay';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'UserProfile'>;

export const UserProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const { username = 'Kai Takahashi' } = route.params;
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="semibold">
          Explorer Profile
        </Typography>
        <IconButton
          icon={<Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textPrimary} />}
          variant="ghost"
        />
      </View>

      <View style={styles.profileHeader}>
        <Avatar name={username} size="xl" emotion="anxiety" />

        <Typography variant="h2" weight="bold" style={styles.name}>
          {username}
        </Typography>

        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.bio}>
          Observing evening reflections. Learning to embrace uncertain weather.
        </Typography>

        <View style={styles.btnRow}>
          <Button
            title={isFollowing ? 'Following' : 'Connect / Follow'}
            variant={isFollowing ? 'secondary' : 'primary'}
            onPress={() => setIsFollowing(!isFollowing)}
            style={styles.actionBtn}
          />
          <Button
            title="Message"
            variant="outline"
            onPress={() => {}}
            style={styles.actionBtn}
          />
        </View>
      </View>

      <View style={styles.section}>
        <AuraDisplay score={480} variant="card" />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
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
    minWidth: 130,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
});
