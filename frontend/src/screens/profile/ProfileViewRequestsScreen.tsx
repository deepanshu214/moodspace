import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { RequestCard } from '@/components/social/RequestCard';
import { EmptyState } from '@/components/common/EmptyState';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileViewRequests'>;

export const ProfileViewRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState([
    {
      id: 'pvr-1',
      name: 'Curious Wanderer',
      bio: 'Wants to view your true author profile from your anonymous post in Calm & Reflection.',
      time: '3h ago',
    },
  ]);

  const handleAction = (id: string) => {
    setRequests(requests.filter((r) => r.id !== id));
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="semibold">
          Profile Reveal Requests ({requests.length})
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.explainer}>
        When you post incognito, listeners who resonated deeply can ask to view your identity. You
        are never obligated to approve.
      </Typography>

      {requests.length > 0 ? (
        <View style={styles.list}>
          {requests.map((item) => (
            <RequestCard
              key={item.id}
              id={item.id}
              requesterName={item.name}
              bio={item.bio}
              timestamp={item.time}
              onAccept={() => handleAction(item.id)}
              onDecline={() => handleAction(item.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          emoji="🔒"
          title="No Reveal Requests"
          description="Your incognito posts remain completely private."
        />
      )}
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
    marginBottom: theme.spacing.md,
  },
  explainer: {
    marginBottom: theme.spacing.xl,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
});
