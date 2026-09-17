import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { validation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingDOB'>;

export const OnboardingDOBScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, setUser } = useAuthStore();
  const [dob, setDob] = useState(user?.dateOfBirth || '2000-05-20');
  const [dobError, setDobError] = useState<string | null>(null);

  const handleNext = async () => {
    const err = validation.validateDOB(dob);
    setDobError(err);
    if (err) return;

    await setUser({ dateOfBirth: dob.trim() });
    navigation.navigate('OnboardingPermissions');
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topProgress}>
        <Typography variant="caption" color={colors.primaryLight} weight="bold">
          STEP 2 OF 3
        </Typography>
        <Typography variant="h2" weight="bold" style={styles.title}>
          Age Confirmation
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          MoodSpace is dedicated to adults 18 and older to foster an emotionally safe, mature
          community.
        </Typography>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dob}
          onChangeText={(val) => {
            setDob(val);
            if (dobError) setDobError(null);
          }}
          error={dobError || undefined}
          helperText="Format: YYYY-MM-DD (e.g. 1998-04-12)"
          leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />}
        />

        <Card variant="flat" style={styles.privacyNoticeCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.accent} />
          <Typography variant="caption" color={colors.textSecondary} style={styles.noticeText}>
            Your exact birthdate is encrypted and never displayed publicly on your profile or
            floating bubbles.
          </Typography>
        </Card>
      </View>

      <Button
        title="Continue to Permissions"
        variant="primary"
        fullWidth
        size="lg"
        onPress={handleNext}
        style={styles.nextBtn}
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
  formSection: {
    width: '100%',
    marginVertical: theme.spacing.lg,
  },
  privacyNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  noticeText: {
    flex: 1,
    marginLeft: theme.spacing.md,
    lineHeight: 18,
  },
  nextBtn: {
    marginTop: theme.spacing.xl,
  },
});
