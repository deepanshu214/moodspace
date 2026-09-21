import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStore } from '@/stores/networkStore';
import { offlineSyncService } from '@/services/offlineSyncService';

export const OfflineBanner: React.FC = () => {
  const { colors } = useTheme();
  const isOnline = useNetworkStore((s) => s.isOnline);
  const isSyncing = useNetworkStore((s) => s.isSyncing);
  const pendingCount = useNetworkStore((s) => s.pendingCount);

  // Hidden if fully online and no pending syncs
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const handleManualSync = () => {
    offlineSyncService.processQueue();
  };

  return (
    <View
      style={[
        styles.banner,
        !isOnline ? styles.bannerOffline : styles.bannerSyncing,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={
            !isOnline
              ? 'cloud-offline-outline'
              : isSyncing
              ? 'sync-outline'
              : 'cloud-upload-outline'
          }
          size={16}
          color={!isOnline ? colors.secondaryInk : colors.accentInk}
        />

        <Typography variant="caption" weight="semibold" color={colors.textPrimary} style={styles.text}>
          {!isOnline
            ? pendingCount > 0
              ? `Working Offline • ${pendingCount} post${pendingCount !== 1 ? 's' : ''} saved on device`
              : 'You are offline • New posts will save on your phone'
            : isSyncing
            ? `Saving ${pendingCount} post${pendingCount !== 1 ? 's' : ''} to server…`
            : `${pendingCount} offline post${pendingCount !== 1 ? 's' : ''} waiting to save`}
        </Typography>
      </View>

      {isOnline && pendingCount > 0 && !isSyncing && (
        <TouchableOpacity
          onPress={handleManualSync}
          activeOpacity={0.75}
          style={styles.syncBtn}
        >
          <Typography variant="caption" weight="bold" color="#FFFFFF">
            Sync Now
          </Typography>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    marginTop: 6,
    marginBottom: 4,
    borderRadius: theme.radius.round,
    borderWidth: 1,
  },
  bannerOffline: {
    backgroundColor: 'rgba(255, 92, 56, 0.12)',
    borderColor: 'rgba(255, 92, 56, 0.35)',
  },
  bannerSyncing: {
    backgroundColor: 'rgba(255, 92, 56, 0.12)',
    borderColor: 'rgba(255, 92, 56, 0.35)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  text: {
    flexShrink: 1,
  },
  syncBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.round,
    marginLeft: 8,
  },
});
