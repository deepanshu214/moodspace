import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingProfile'>;

export const OnboardingProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  const [bio, setBio] = useState('');

  const handleNext = () => {
    setUser({ bio });
    navigation.navigate('OnboardingDOB');
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topProgress}>
        <Typography variant="caption" color={theme.colors.primaryLight} weight="bold">
          STEP 1 OF 3
        </Typography>
        <Typography variant="h2" weight="bold" style={styles.title}>
          Set Up Your Aura
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary}>
          Choose an avatar or leave it as an emotional aura ring.
        </Typography>
      </View>

      <View style={styles.avatarSection}>
        <Avatar name={user?.displayName || 'Soul'} size="xl" emotion="calm" />
        <TouchableOpacity style={styles.uploadBtn} activeOpacity={0.8}>
          <Ionicons name="camera-reverse" size={16} color="#FFFFFF" />
          <Typography variant="caption" color="#FFFFFF" weight="semibold" style={{ marginLeft: 6 }}>
            Upload Picture
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Input
          label="Your Bio / Emotional Philosophy"
          placeholder="e.g. Navigating calm waters, seeking mindful connection."
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          helperText="Max 160 characters"
          style={styles.bioInput}
        />
      </View>

      <Button
        title="Continue"
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
  avatarSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceHighlight,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formSection: {
    width: '100%',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  nextBtn: {
    marginTop: theme.spacing.xl,
  },
});
