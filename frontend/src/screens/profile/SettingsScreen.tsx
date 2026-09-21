import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
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
import { useTheme, ThemeMode } from '@/context';
import { Ionicons } from '@expo/vector-icons';
import { PrivacySettingsPayload } from '@/api/types';
import { AppWalkthroughModal, InteractiveFeatureTour } from '@/components/tutorial';
import { showAlert } from '@/components/common/AppDialog';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Settings'>;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { themeMode, setThemeMode, isDark } = useTheme();
  const { mutate: logoutUser, isPending: loggingOut } = useLogout();
  const { mutate: deleteUserAccount, isPending: deletingAccount } = useDeleteAccount();

  const { data: privacySettings } = usePrivacySettings();
  const updateSettingsMutation = useUpdatePrivacySettings();

  const settings: PrivacySettingsPayload = privacySettings || MOCK_PRIVACY_SETTINGS;

  const [incognitoByDefault, setIncognitoByDefault] = useState(settings.incognito_by_default);
  const [locationFuzzing, setLocationFuzzing] = useState(settings.location_fuzzing);
  const [showTourModal, setShowTourModal] = useState(false);
  const [showWalkthroughModal, setShowWalkthroughModal] = useState(false);

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
    showAlert(
      'Export Emotional Journey',
      'A complete encrypted archive of your emotional check-ins, reflections, and sanctuary contributions will be prepared for export.',
      [{ text: 'Cancel', style: 'cancel' }, { text: 'Download Archive', onPress: () => showAlert('Export Started', 'Your emotional data package is compiling.') }]
    );
  };

  const handleLogout = () => {
    showAlert('Sign Out', 'Are you sure you wish to disconnect from MoodSpace?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logoutUser() },
    ]);
  };

  const handleDeleteAccount = () => {
    showAlert(
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
      <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: colors.ink, backgroundColor: colors.surface }]}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={18} color={colors.textPrimary} />
        </TouchableOpacity>
        <Typography variant="h4" style={{ color: colors.textPrimary, flex: 1, marginLeft: 12 }}>
          Settings & Privacy
        </Typography>
      </View>

      {/* ── 0. APPEARANCE & THEME ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          APPEARANCE & THEME
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.themeSelectorRow}>
            {(
              [
                { mode: 'dark', label: 'Dark', icon: 'moon' },
                { mode: 'light', label: 'Light', icon: 'sunny' },
                { mode: 'system', label: 'System', icon: 'phone-portrait-outline' },
              ] as const
            ).map((opt) => {
              const active = themeMode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  activeOpacity={0.7}
                  onPress={() => setThemeMode(opt.mode as ThemeMode)}
                  style={[
                    styles.themeOptionBtn,
                    active && styles.themeOptionBtnActive,
                  ]}
                >
                  <Ionicons
                    name={opt.icon as any}
                    size={20}
                    color={active ? colors.accentInk : colors.textMuted}
                  />
                  <Typography
                    variant="caption"
                    weight={active ? 'bold' : 'medium'}
                    color={active ? colors.accentInk : colors.textSecondary}
                    style={{ marginTop: 4 }}
                  >
                    {opt.label}
                  </Typography>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>
      </View>

      {/* ── 1. PRIVACY & ANONYMITY ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          PRIVACY & ANONYMITY
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Default to Anonymous Check-In</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Hide your name & avatar on map bubbles and shared posts
              </Typography>
            </View>
            <Switch
              value={incognitoByDefault}
              onValueChange={(val) => {
                setIncognitoByDefault(val);
                handleUpdateSetting('incognito_by_default', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow, { borderTopColor: colors.border }]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Location Privacy Fuzzing</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Jitter coordinates by ~500m to conceal exact residence
              </Typography>
            </View>
            <Switch
              value={locationFuzzing}
              onValueChange={(val) => {
                setLocationFuzzing(val);
                handleUpdateSetting('location_fuzzing', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>


          <View style={[styles.row, styles.dividerRow, { borderTopColor: colors.border }]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Allow 1-on-1 Matching</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Let people feeling similar emotions connect with you in private chats
              </Typography>
            </View>
            <Switch
              value={echoMatching}
              onValueChange={(val) => {
                setEchoMatching(val);
                handleUpdateSetting('allow_echo_matching', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* Profile Visibility Selector */}
          <View style={[styles.dividerRow, { borderTopColor: colors.border }]}>
            <Typography variant="body" weight="semibold" style={{ marginBottom: 6 }}>
              Profile Visibility
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
                  style={[
                    styles.visPill,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                    visibility === opt && styles.visPillActive,
                  ]}
                >
                  <Typography
                    variant="caption"
                    weight={visibility === opt ? 'bold' : 'medium'}
                    color={visibility === opt ? '#FFFFFF' : colors.textSecondary}
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
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          NOTIFICATIONS & REMINDERS
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Friendly Reactions</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Alert me when someone sends hugs, smiles, or comments
              </Typography>
            </View>
            <Switch
              value={empathyAlerts}
              onValueChange={setEmpathyAlerts}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow, { borderTopColor: colors.border }]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Daily Check-in Reminder</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Gentle reminder at 8:00 PM to record your day's mood
              </Typography>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={setDailyReminder}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* ── 3. SENSORY EXPERIENCE ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          SOUND & VIBRATION
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Vibration Feedback</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Vibrate gently when tapping buttons, reactions, and mood bubbles
              </Typography>
            </View>
            <Switch
              value={haptics}
              onValueChange={(val) => {
                setHaptics(val);
                handleUpdateSetting('haptics_enabled', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          <View style={[styles.row, styles.dividerRow, { borderTopColor: colors.border }]}>
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Sound Effects</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Play subtle sound chime when posting a mood
              </Typography>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={(val) => {
                setSoundEffects(val);
                handleUpdateSetting('sound_effects_enabled', val);
              }}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>
        </Card>
      </View>

      {/* ── 4. APP TOUR & FEATURE GUIDE ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          APP TOUR & GUIDES
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity
            style={styles.exportRow}
            activeOpacity={0.75}
            onPress={() => setShowTourModal(true)}
          >
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">View Feature Walkthrough (7-Step Interactive Demo)</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Step-by-step interactive walkthrough with hands-on mini demos
              </Typography>
            </View>
            <Ionicons name="sparkles" size={20} color={colors.accentInk} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.exportRow}
            activeOpacity={0.75}
            onPress={() => setShowWalkthroughModal(true)}
          >
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Quick Overview Cards</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Swipeable summary cards of core MoodSpace features
              </Typography>
            </View>
            <Ionicons name="help-circle-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* ── 5. DATA EXPORT ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          DOWNLOAD YOUR DATA
        </Typography>

        <Card variant="elevated" style={styles.card}>
          <TouchableOpacity
            style={styles.exportRow}
            activeOpacity={0.75}
            onPress={handleExportData}
          >
            <View style={styles.rowText}>
              <Typography variant="body" weight="semibold">Export My Mood History</Typography>
              <Typography variant="caption" color={colors.textMuted}>
                Download a copy of your mood check-ins and reflections
              </Typography>
            </View>
            <Ionicons name="download-outline" size={20} color={colors.accentInk} />
          </TouchableOpacity>
        </Card>
      </View>

      {/* ── 6. ACCOUNT ACTIONS ── */}
      <View style={styles.section}>
        <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.sectionTitle}>
          ACCOUNT ACTIONS
        </Typography>

        <View style={styles.btnStack}>
          <Button
            title="Sign Out"
            variant="secondary"
            loading={loggingOut}
            onPress={handleLogout}
            leftIcon={<Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />}
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

      <Typography variant="caption" color={colors.textMuted} style={styles.versionText}>
        MoodSpace v1.0.0 • Emotional Wellness Network
      </Typography>

      {/* Interactive Feature Tour (with live sandboxes) */}
      <InteractiveFeatureTour
        visible={showTourModal}
        onClose={() => setShowTourModal(false)}
      />

      {/* Feature Walkthrough Overview Modal */}
      <AppWalkthroughModal
        visible={showWalkthroughModal}
        onClose={() => setShowWalkthroughModal(false)}
      />
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
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderBottomWidth: 2,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dividerRow: {
    borderTopWidth: 1,
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
    borderWidth: 1,
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
  divider: {
    height: 1,
    marginVertical: 12,
  },
  btnStack: {
    gap: 12,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOptionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeOptionBtnActive: {
    backgroundColor: theme.colors.surfaceWarm,
    borderColor: theme.colors.ink,
  },
  versionText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
});
