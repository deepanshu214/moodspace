import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingPermissions'>;

export const OnboardingPermissionsScreen: React.FC<Props> = ({ navigation }) => {
  const [locationGranted, setLocationGranted] = useState(true);
  const [notificationsGranted, setNotificationsGranted] = useState(true);

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topProgress}>
        <Typography variant="caption" color={theme.colors.primaryLight} weight="bold">
          STEP 3 OF 3
        </Typography>
        <Typography variant="h2" weight="bold" style={styles.title}>
          Mindful Permissions
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary}>
          MoodSpace uses these features strictly to enhance your connection experience.
        </Typography>
      </View>

      <View style={styles.permissionsList}>
        {/* Location Permission */}
        <Card variant="elevated" style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={26} color={theme.colors.primaryLight} />
          </View>
          <View style={styles.permissionMeta}>
            <Typography variant="title">Atmospheric Map Location</Typography>
            <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.desc}>
              Enables local emotional pulse and shows nearby mood bubbles on your map. Coordinates
              are fuzzy-hashed to protect privacy.
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => setLocationGranted(!locationGranted)}
            style={[styles.toggleBtn, locationGranted && styles.toggleBtnActive]}
          >
            <Ionicons
              name={locationGranted ? 'checkmark' : 'ellipse-outline'}
              size={18}
              color={locationGranted ? '#FFFFFF' : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </Card>

        {/* Notifications Permission */}
        <Card variant="elevated" style={styles.permissionCard}>
          <View style={styles.iconCircle}>
            <Ionicons name="notifications" size={26} color={theme.colors.accent} />
          </View>
          <View style={styles.permissionMeta}>
            <Typography variant="title">Support & Empathy Alerts</Typography>
            <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.desc}>
              Receive subtle notifications when someone sends empathy to your bubble or when a deep
              mood match is discovered.
            </Typography>
          </View>
          <TouchableOpacity
            onPress={() => setNotificationsGranted(!notificationsGranted)}
            style={[styles.toggleBtn, notificationsGranted && styles.toggleBtnActive]}
          >
            <Ionicons
              name={notificationsGranted ? 'checkmark' : 'ellipse-outline'}
              size={18}
              color={notificationsGranted ? '#FFFFFF' : theme.colors.textMuted}
            />
          </TouchableOpacity>
        </Card>
      </View>

      <Button
        title="Complete Setup"
        variant="primary"
        fullWidth
        size="lg"
        onPress={() => navigation.navigate('OnboardingComplete')}
        style={styles.completeBtn}
      />
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topProgress: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginTop: 6,
    marginBottom: 4,
  },
  permissionsList: {
    gap: 16,
    marginVertical: theme.spacing.md,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionMeta: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
  },
  desc: {
    marginTop: 4,
    lineHeight: 18,
  },
  toggleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  completeBtn: {
    marginTop: theme.spacing.xl,
  },
});
