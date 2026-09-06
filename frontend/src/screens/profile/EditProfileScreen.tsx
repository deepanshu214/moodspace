import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { Avatar } from '@/components/common/Avatar';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

export const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, setUser } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || 'Elena Rostova');
  const [bio, setBio] = useState(user?.bio || 'Holding space for calm moments, deep ocean walks.');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setUser({ displayName, bio });
      setSaving(false);
      navigation.goBack();
    }, 600);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <View style={styles.topBar}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <Typography variant="title" weight="semibold">
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

      <View style={styles.avatarSection}>
        <Avatar name={displayName} size="xl" emotion="calm" />
        <TouchableOpacity style={styles.changePicBtn} activeOpacity={0.8}>
          <Typography variant="caption" color={theme.colors.primaryLight} weight="bold">
            Change Aura Avatar
          </Typography>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Input
          label="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        <Input
          label="Emotional Philosophy / Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={styles.bioInput}
        />
      </View>
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
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  changePicBtn: {
    marginTop: theme.spacing.md,
  },
  form: {
    gap: 12,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
