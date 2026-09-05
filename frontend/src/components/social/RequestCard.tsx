import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export interface RequestCardProps {
  id: string;
  requesterName: string;
  requesterAvatar?: string | null;
  bio?: string;
  mutualCount?: number;
  timestamp?: string;
  onAccept: () => void;
  onDecline: () => void;
  isAccepting?: boolean;
  isDeclining?: boolean;
  style?: ViewStyle;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  requesterName,
  requesterAvatar,
  bio,
  mutualCount,
  timestamp,
  onAccept,
  onDecline,
  isAccepting = false,
  isDeclining = false,
  style,
}) => {
  return (
    <Card variant="elevated" style={[styles.container, style]}>
      <View style={styles.topRow}>
        <Avatar source={requesterAvatar} name={requesterName} size="md" />

        <View style={styles.meta}>
          <Typography variant="title" numberOfLines={1}>
            {requesterName}
          </Typography>

          {bio ? (
            <Typography variant="bodySmall" color={theme.colors.textSecondary} numberOfLines={1}>
              {bio}
            </Typography>
          ) : null}

          {mutualCount !== undefined && mutualCount > 0 && (
            <Typography variant="caption" color={theme.colors.textMuted} style={styles.mutual}>
              {mutualCount} mutual connection{mutualCount > 1 ? 's' : ''}
            </Typography>
          )}
        </View>

        {timestamp && (
          <Typography variant="caption" color={theme.colors.textMuted} style={styles.time}>
            {timestamp}
          </Typography>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Decline"
          variant="secondary"
          size="sm"
          onPress={onDecline}
          loading={isDeclining}
          disabled={isAccepting}
          style={styles.declineBtn}
        />
        <Button
          title="Accept"
          variant="primary"
          size="sm"
          onPress={onAccept}
          loading={isAccepting}
          disabled={isDeclining}
          style={styles.acceptBtn}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  meta: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  mutual: {
    marginTop: 2,
  },
  time: {
    alignSelf: 'flex-start',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.md,
    gap: 10,
  },
  declineBtn: {
    flex: 1,
  },
  acceptBtn: {
    flex: 1,
  },
});
