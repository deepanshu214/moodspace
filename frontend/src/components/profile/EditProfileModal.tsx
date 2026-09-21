import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { theme, shadows } from '@/theme';
// This bottom sheet is an intentionally always-dark glass surface regardless
// of the app's light/dark theme, so it pulls text colors from the dark palette.
import { darkColors as colors } from '@/theme/colors';
import { Typography } from '../common/Typography';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { haptics } from '@/theme/haptics';
import { showAlert } from '@/components/common/AppDialog';

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentBio: string;
  currentAvatar?: string | null;
  onSave: (updated: { displayName: string; bio: string; avatarUrl?: string }) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  currentName,
  currentBio,
  currentAvatar,
  onSave,
}) => {
  const [name, setName] = useState(currentName);
  const [bio, setBio] = useState(currentBio);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(currentAvatar || undefined);
  const [isPicking, setIsPicking] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(currentName);
      setBio(currentBio);
      setAvatarUri(currentAvatar || undefined);
    }
  }, [visible, currentName, currentBio, currentAvatar]);

  const handlePickImage = async () => {
    try {
      haptics.selection();
      setIsPicking(true);

      // 1. Explicitly request photo gallery permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        showAlert(
          'Photo Access Needed',
          'MoodSpace needs permission to access your photo library so you can pick a personal profile picture. Please enable Photos access in your device Settings.',
          [{ text: 'OK' }]
        );
        setIsPicking(false);
        return;
      }

      // 2. Open phone gallery image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
        haptics.light();
      }
    } catch (e) {
      showAlert('Unable to pick photo', 'Please try selecting your picture again.');
    } finally {
      setIsPicking(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert('Name Required', 'Please enter your display name.');
      return;
    }
    haptics.medium();
    onSave({
      displayName: name.trim(),
      bio: bio.trim(),
      avatarUrl: avatarUri,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.sheetContainer}>
          <BlurView intensity={45} tint="dark" style={styles.blurBackground}>
            <View style={styles.header}>
              <Typography variant="h3" weight="bold" color={colors.textPrimary}>
                Edit Profile
              </Typography>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
              {/* ── Avatar Picker Section ── */}
              <View style={styles.avatarSection}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handlePickImage}
                  disabled={isPicking}
                  style={styles.avatarWrapper}
                >
                  <Avatar
                    name={name || 'User'}
                    source={avatarUri}
                    size="xl"
                    emotion="joy"
                  />
                  <View style={styles.cameraBadge}>
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={handlePickImage}
                  style={{ marginTop: 8 }}
                >
                  <Typography variant="caption" weight="bold" color={colors.accentInk}>
                    {avatarUri ? 'Change Photo from Gallery' : 'Add Photo from Gallery'}
                  </Typography>
                </TouchableOpacity>
              </View>

              {/* ── Name Field ── */}
              <View style={styles.inputGroup}>
                <Typography variant="label" weight="semibold" color={colors.textSecondary} style={styles.inputLabel}>
                  Display Name
                </Typography>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textMuted}
                  maxLength={40}
                  style={styles.input}
                />
              </View>

              {/* ── Bio Field ── */}
              <View style={styles.inputGroup}>
                <Typography variant="label" weight="semibold" color={colors.textSecondary} style={styles.inputLabel}>
                  About You (Bio)
                </Typography>
                <TextInput
                  value={bio}
                  onChangeText={setBio}
                  placeholder="What brings you peace or joy today?"
                  placeholderTextColor={colors.textMuted}
                  maxLength={160}
                  multiline
                  numberOfLines={3}
                  style={[styles.input, styles.bioInput]}
                />
              </View>

              {/* ── Action Buttons ── */}
              <View style={styles.footerActions}>
                <Button
                  title="Cancel"
                  variant="secondary"
                  size="md"
                  onPress={onClose}
                  style={styles.cancelBtn}
                />

                <Button
                  title="Save Profile"
                  variant="primary"
                  size="md"
                  onPress={handleSave}
                  style={styles.saveBtn}
                />
              </View>
            </ScrollView>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(18, 19, 22, 0.75)',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    ...shadows.heavy,
  },
  blurBackground: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    backgroundColor: 'rgba(28, 30, 36, 0.92)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingBottom: 10,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: colors.textPrimary,
    fontSize: 15,
  },
  bioInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 2,
  },
});
