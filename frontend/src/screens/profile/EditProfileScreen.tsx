import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfile } from '@/hooks/useAuth';
import { validation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const EMOTION_PRESETS = ['calm', 'joy', 'anxiety', 'love', 'sadness', 'excitement'];

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || 'Elena Rostova');
  const [bio, setBio] = useState(user?.bio || 'Holding space for calm moments, deep ocean walks.');
  const [selectedEmotion, setSelectedEmotion] = useState('calm');
  const [errorMsg, setErrorMsg] = useState('');

  const { mutate: updateProfile, isPending: saving } = useUpdateProfile();

  const handleSave = () => {
    const nameError = validation.validateDisplayName(displayName);
    if (nameError) {
      setErrorMsg(nameError);
      return;
    }
    const bioError = validation.validateBio(bio);
    if (bioError) {
      setErrorMsg(bioError);
      return;
    }

    setErrorMsg('');
    updateProfile(
      {
        display_name: displayName.trim(),
        bio: bio.trim(),
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
        onError: () => {
          navigation.goBack();
        },
      }
    );
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      {/* Top Bar Header */}
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="bold">
          Edit Profile
        </Typography>
        <Button
          title="Save"
          variant="primary"
          size="sm"
          loading={saving}
          onPress={handleSave}
        />
      </View>

      {/* Avatar & Emotion Tone Picker */}
      <View style={styles.avatarSection}>
        <Avatar name={displayName} size="xl" emotion={selectedEmotion} />
        <Typography variant="caption" color={colors.textMuted} style={styles.toneLabel}>
          Select your ambient aura hue:
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
          {EMOTION_PRESETS.map((emo) => {
            const config = theme.getEmotionConfig(emo);
            const isSelected = selectedEmotion === emo;
            return (
              <TouchableOpacity
                key={emo}
                activeOpacity={0.8}
                onPress={() => setSelectedEmotion(emo)}
                style={[
                  styles.presetChip,
                  { borderColor: isSelected ? config.primary : 'rgba(255, 255, 255, 0.1)' },
                  isSelected && { backgroundColor: config.background },
                ]}
              >
                <Typography variant="caption">{config.emoji}</Typography>
                <Typography
                  variant="caption"
                  weight={isSelected ? 'bold' : 'medium'}
                  color={isSelected ? config.primary : colors.textSecondary}
                >
                  {config.label}
                </Typography>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Form Fields */}
      <View style={styles.form}>
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            setErrorMsg('');
          }}
          placeholder="Your name or moniker"
          error={errorMsg}
        />

        <View style={styles.bioContainer}>
          <Input
            label="Emotional Philosophy / Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="What grounds you?"
            multiline
            numberOfLines={4}
            maxLength={160}
            style={styles.bioInput}
          />
          <Typography variant="caption" color={colors.textMuted} style={styles.bioCounter}>
            {bio.length}/160 characters
          </Typography>
        </View>
      </View>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  toneLabel: {
    marginTop: 12,
    marginBottom: 8,
  },
  presetScroll: {
    flexDirection: 'row',
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    marginHorizontal: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  form: {
    gap: 14,
  },
  bioContainer: {
    position: 'relative',
  },
  bioInput: {
    minHeight: 110,
    textAlignVertical: 'top',
  },
  bioCounter: {
    textAlign: 'right',
    marginTop: 4,
  },
});
