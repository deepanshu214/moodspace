import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { validation } from '@/utils/validation';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingProfile'>;

const avatarPresets = ['calm', 'joy', 'anxiety', 'love', 'excitement', 'neutral'];

export const OnboardingProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, setUser } = useAuthStore();
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [bio, setBio] = useState(user?.bio || '');
  const [bioError, setBioError] = useState<string | null>(null);

  const handleNext = async () => {
    const bErr = validation.validateBio(bio);
    setBioError(bErr);
    if (bErr) return;

    await setUser({ bio: bio.trim() });
    navigation.navigate('OnboardingDOB');
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topProgress}>
        <Typography variant="caption" color={colors.primaryLight} weight="bold">
          STEP 1 OF 3
        </Typography>
        <Typography variant="h2" weight="bold" style={styles.title}>
          Set Up Your Aura
        </Typography>
        <Typography variant="body" color={colors.textSecondary}>
          Choose your starting aura tone and share a few words about your emotional philosophy.
        </Typography>
      </View>

      {/* Main Avatar Preview */}
      <View style={styles.avatarSection}>
        <Avatar
          name={user?.displayName || 'Soul'}
          size="xl"
          emotion={selectedEmotion}
        />
        <Typography variant="bodySmall" weight="bold" color={colors.primaryLight} style={styles.auraLabel}>
          {colors.emotions[selectedEmotion]?.label || 'Calm'} Aura
        </Typography>

        {/* Emotion Preset Chips */}
        <Typography variant="caption" color={colors.textMuted} style={styles.presetHeading}>
          Choose Tone
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
          {avatarPresets.map((emo) => (
            <TouchableOpacity
              key={emo}
              activeOpacity={0.8}
              onPress={() => setSelectedEmotion(emo)}
              style={[
                styles.presetPill,
                { backgroundColor: colors.surfaceElevated },
                selectedEmotion === emo && { backgroundColor: colors.surfaceHighlight, transform: [{ scale: 1.1 }] },
                { borderColor: colors.emotions[emo]?.border || colors.border },
              ]}
            >
              <Typography variant="body">{colors.emotions[emo]?.emoji}</Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bio Field with Character Counter */}
      <View style={styles.formSection}>
        <Input
          label="Your Emotional Philosophy / Bio"
          placeholder="e.g. Navigating calm waters, seeking mindful connection."
          value={bio}
          onChangeText={(val) => {
            setBio(val);
            if (bioError) setBioError(null);
          }}
          error={bioError || undefined}
          multiline
          numberOfLines={3}
          helperText={`${bio.length}/160 characters`}
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    marginTop: 6,
    marginBottom: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.lg,
  },
  auraLabel: {
    marginTop: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  presetHeading: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  presetPill: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginHorizontal: 6,
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
