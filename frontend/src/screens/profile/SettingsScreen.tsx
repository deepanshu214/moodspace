import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useLogout, useDeleteAccount } from '@/hooks/useAuth';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: logoutUser, isPending: loggingOut } = useLogout();
  const { mutate: deleteUserAccount, isPending: deletingAccount } = useDeleteAccount();

  const [incognitoByDefault, setIncognitoByDefault] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationFuzzing, setLocationFuzzing] = useState(true);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you wish to disconnect from MoodSpace?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logoutUser() },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently erase your emotional journey? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => deleteUserAccount() },
      ]
    );
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="bold">
          Settings & Privacy
        </Typography>
        <View style={{ width: 44 }} />
      </View>

      {/* 1. PRIVACY & SAFETY */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          PRIVACY & ANONYMITY
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Default to Incognito Mode</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>Hide username and avatar on map bubbles</Typography>
            </View>
            <Switch
              value={incognitoByDefault}
              onValueChange={setIncognitoByDefault}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Atmospheric Location Fuzzing</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>Jitter GPS coordinates by 500m to mask exact location</Typography>
            </View>
            <Switch
              value={locationFuzzing}
              onValueChange={setLocationFuzzing}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* 2. NOTIFICATIONS */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          NOTIFICATIONS
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Empathy & Resonances</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>Receive notifications when others react to your check-ins</Typography>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* 3. SESSION & ACCOUNT ACTIONS */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          ACCOUNT ACTIONS
        </Typography>

        <View style={styles.btnStack}>
          <Button
            title="Sign Out"
            variant="secondary"
            loading={loggingOut}
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={18} color={theme.colors.textPrimary} />}
          />

          <Button
            title="Delete Account"
            variant="danger"
            loading={deletingAccount}
            onPress={handleDeleteAccount}
            leftIcon={<Ionicons name="trash-outline" size={18} color="#FFFFFF" />}
          />
        </View>
      </View>

      <Typography variant="caption" color={theme.colors.textMuted} style={styles.versionText}>
        MoodSpace v1.0.0 • Atmospheric Emotional Network
      </Typography>
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
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    marginBottom: theme.spacing.sm,
    letterSpacing: 0.5,
  },
  card: {
    padding: theme.spacing.lg,
    backgroundColor: 'rgba(17, 20, 34, 0.85)',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dividerRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  btnStack: {
    gap: 12,
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
