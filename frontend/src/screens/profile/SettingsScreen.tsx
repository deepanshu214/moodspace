import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { IconButton } from '@/components/common/IconButton';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useLogout, useDeleteAccount } from '@/hooks/useAuth';
import { usePrivacySettings, useUpdatePrivacySettings, MOCK_PRIVACY_SETTINGS } from '@/hooks/useUserStats';
import { Ionicons } from '@expo/vector-icons';
import { PrivacySettingsPayload } from '@/api/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { mutate: logoutUser, isPending: loggingOut } = useLogout();
  const { mutate: deleteUserAccount, isPending: deletingAccount } = useDeleteAccount();

  const { data: privacySettings } = usePrivacySettings();
  const updateSettingsMutation = useUpdatePrivacySettings();

  const settings: PrivacySettingsPayload = privacySettings || MOCK_PRIVACY_SETTINGS;

  const [incognitoByDefault, setIncognitoByDefault] = useState(settings.incognito_by_default);
  const [locationFuzzing, setLocationFuzzing] = useState(settings.location_fuzzing);

  const [visibility, setVisibility] = useState<'public' | 'connections_only' | 'private'>(
    settings.profile_visibility || 'public'
  );
  const [echoMatching, setEchoMatching] = useState(settings.allow_echo_matching ?? true);
  const [showStreak, setShowStreak] = useState(settings.show_streak_on_profile ?? true);
  const [showAura, setShowAura] = useState(settings.show_aura_on_profile ?? true);
  const [empathyAlerts, setEmpathyAlerts] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [haptics, setHaptics] = useState(settings.haptics_enabled ?? true);
  const [soundEffects, setSoundEffects] = useState(settings.sound_effects_enabled ?? true);

  const handleUpdateSetting = (key: keyof PrivacySettingsPayload, val: any) => {
    updateSettingsMutation.mutate({ [key]: val });
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Emotional Journey',
      'A complete encrypted archive of your emotional check-ins, reflections, and sanctuary contributions will be prepared for export.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Download Archive', onPress: () => Alert.alert('Export Started', 'Your emotional data package is compiling.') }]
    );
  };

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
      {/* ── Top Bar ── */}
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

      {/* ── 1. PRIVACY & ANONYMITY ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          PRIVACY & ANONYMITY
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Default to Wandering Spirit</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Automatically cloak name & avatar on map bubbles & feed reflections
              </Typography>
            </View>
            <Switch
              value={incognitoByDefault}
              onValueChange={(val) => {
                setIncognitoByDefault(val);
                handleUpdateSetting('incognito_by_default', val);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Atmospheric Location Fuzzing</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Jitter coordinates by ~500m to conceal exact residence
              </Typography>
            </View>
            <Switch
              value={locationFuzzing}
              onValueChange={(val) => {
                setLocationFuzzing(val);
                handleUpdateSetting('location_fuzzing', val);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>


          <View style={[styles.row, styles.dividerRow]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Allow Resonance Matching</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Surface my wavelength in the Echo resonance matching pool
              </Typography>
            </View>
            <Switch
              value={echoMatching}
              onValueChange={(val) => {
                setEchoMatching(val);
                handleUpdateSetting('allow_echo_matching', val);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          {/* Profile Visibility Selector */}
          <View style={styles.dividerRow}>
            <Typography variant="body" weight="semibold" style={{ marginBottom: 6 }}>
              Profile Sanctuary Visibility
            </Typography>
            <View style={styles.visibilityPills}>
              {(['public', 'connections_only', 'private'] as const).map((opt) => (
                <TouchableOpacity
                  key={opt}
                  activeOpacity={0.75}
                  onPress={() => {
                    setVisibility(opt);
                    handleUpdateSetting('profile_visibility', opt);
                  }}
                  style={[styles.visPill, visibility === opt && styles.visPillActive]}
                >
                  <Typography
                    variant="caption"
                    weight={visibility === opt ? 'bold' : 'medium'}
                    color={visibility === opt ? '#FFFFFF' : theme.colors.textSecondary}
                  >
                    {opt === 'public' ? 'Public' : opt === 'connections_only' ? 'Connections' : 'Private'}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>
      </View>

      {/* ── 2. NOTIFICATIONS & REMINDERS ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          NOTIFICATIONS & MINDFUL REMINDERS
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Empathy Echoes & Reactions</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Alerts when someone resonates with your reflection
              </Typography>
            </View>
            <Switch
              value={empathyAlerts}
              onValueChange={setEmpathyAlerts}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Evening Mindful Check-in</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Daily breath reminder at 8:00 PM
              </Typography>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* ── 3. SENSORY EXPERIENCE ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          SENSORY FEEDBACK
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Haptic Resonance</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Gentle vibrations on bubble taps and emotional reactions
              </Typography>
            </View>
            <Switch
              value={haptics}
              onValueChange={(val) => {
                setHaptics(val);
                handleUpdateSetting('haptics_enabled', val);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Atmospheric Chimes</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Subtle auditory chimes on bubble release
              </Typography>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={(val) => {
                setSoundEffects(val);
                handleUpdateSetting('sound_effects_enabled', val);
              }}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* ── 4. DATA SOVEREIGNTY & EXPORT ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.sectionTitle}>
          DATA SOVEREIGNTY
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity
            style={styles.exportRow}
            activeOpacity={0.75}
            onPress={handleExportData}
          >
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Export Emotional Journey</Typography>
              <Typography variant="caption" color={theme.colors.textMuted}>
                Download a complete encrypted copy of your mood data & reflections
              </Typography>
            </View>
            <Ionicons name="download-outline" size={20} color={theme.colors.primaryLight} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* ── 5. ACCOUNT ACTIONS ── */}
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
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dividerRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  rowText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  visibilityPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  visPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.round,
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  visPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  exportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  btnStack: {
    gap: 12,
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
