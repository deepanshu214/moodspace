import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { AuraDisplay } from './AuraDisplay';

export interface FollowUserTileProps {
  id: string;
  name: string;
  avatarUrl?: string | null;
  bio?: string | null;
  auraScore?: number;
  initialFollowing?: boolean;
  onPress?: () => void;
  onFollowToggle?: (following: boolean) => void;
}

export const FollowUserTile: React.FC<FollowUserTileProps> = ({
  id,
  name,
  avatarUrl,
  bio,
  auraScore,
  initialFollowing = false,
  onPress,
  onFollowToggle,
}) => {
  const [following, setFollowing] = useState(initialFollowing);

  const handleToggle = () => {
    const nextState = !following;
    setFollowing(nextState);
    onFollowToggle?.(nextState);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={styles.container}
    >
      <Avatar source={avatarUrl} name={name} size="md" />

      <View style={styles.centerMeta}>
        <View style={styles.nameRow}>
          <Typography variant="body" weight="bold" numberOfLines={1}>
            {name}
          </Typography>
          {auraScore !== undefined && (
            <AuraDisplay score={auraScore} variant="compact" />
          )}
        </View>

        {bio ? (
          <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
            {bio}
          </Typography>
        ) : null}
      </View>

      <Button
        title={following ? 'Connected' : 'Connect'}
        variant={following ? 'outline' : 'primary'}
        size="sm"
        onPress={handleToggle}
        style={styles.btn}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 8,
    gap: 12,
  },
  centerMeta: {
    flex: 1,
    gap: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btn: {
    minWidth: 90,
  },
});
