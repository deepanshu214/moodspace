import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingDOB'>;

export const OnboardingDOBScreen: React.FC<Props> = ({ navigation }) => {
  const [dob, setDob] = useState('2000-01-15');
  const { setUser } = useAuthStore();

  const handleNext = () => {
    setUser({ dateOfBirth: dob });
    navigation.navigate('OnboardingPermissions');
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topProgress}>
        <Typography variant="caption" color={theme.colors.primaryLight} weight="bold">
          STEP 2 OF 3
        </Typography>
        <Typography variant="h2" weight="bold" style={styles.title}>
          Age Confirmation
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary}>
          MoodSpace is dedicated to adults 18 and older to ensure a safe, emotionally mature community.
        </Typography>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dob}
          onChangeText={setDob}
          helperText="Your exact birthdate will never be publicly displayed"
        />
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
    marginBottom: theme.spacing.xxl,
  },
  title: {
    marginTop: 6,
    marginBottom: 4,
  },
  formSection: {
    width: '100%',
    marginVertical: theme.spacing.xxl,
  },
  nextBtn: {
    marginTop: theme.spacing.xl,
  },
});
