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

type Props = NativeStackScreenProps<ProfileStackParamList, 'FollowRequests'>;

export const FollowRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const [requests, setRequests] = useState([
    {
      id: 'r-1',
      name: 'Kai Takahashi',
      bio: 'Navigating quiet paths & daily meditations',
      mutuals: 3,
      time: '2h ago',
    },
    {
      id: 'r-2',
      name: 'Maya Lin',
      bio: 'Expressive painter & ambient sound explorer',
      mutuals: 1,
      time: 'Yesterday',
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
          Follow Requests ({requests.length})
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      {requests.length > 0 ? (
        <View style={styles.list}>
          {requests.map((item) => (
            <RequestCard
              key={item.id}
              id={item.id}
              requesterName={item.name}
              bio={item.bio}
              mutualCount={item.mutuals}
              timestamp={item.time}
              onAccept={() => handleAction(item.id)}
              onDecline={() => handleAction(item.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyState
          emoji="🤝"
          title="No Pending Requests"
          description="All connection requests have been reviewed."
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
    marginBottom: theme.spacing.xl,
  },
  list: {
    gap: 12,
  },
});
