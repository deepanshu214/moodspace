import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CommunityStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useCreateCommunity } from '@/hooks/useCommunity';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CreateCommunity'>;

const CATEGORIES = [
  'Mindfulness',
  'Vulnerability',
  'Anxiety Support',
  'Healing & Grief',
  'Joy & Wins',
  'Solitude',
  'Sleep & Dreams',
];

const PRIVACY_OPTIONS = [
  {
    id: 'public',
    title: 'Public Sanctuary',
    desc: 'Anyone can discover, read, and share reflections.',
    icon: 'earth',
  },
  {
    id: 'restricted',
    title: 'Protected Circle',
    desc: 'Publicly visible, but joining requires mindful intent.',
    icon: 'shield-outline',
  },
  {
    id: 'private',
    title: 'Cloaked Enclave',
    desc: 'Hidden from discovery; accessible only via private link.',
    icon: 'lock-closed-outline',
  },
];

export const CreateCommunityModal: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Mindfulness');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [privacy, setPrivacy] = useState<'public' | 'restricted' | 'private'>('public');

  const { mutate: createCommunity, isPending } = useCreateCommunity();

  const handleCreate = () => {
    if (name.trim().length < 2) {
      Alert.alert('Sanctuary Name Required', 'Please provide a name of at least 2 characters.');
      return;
    }
    if (description.trim().length < 10) {
      Alert.alert('Intention Needed', 'Please describe the intention of this sanctuary in at least 10 characters.');
      return;
    }

    createCommunity(
      {
        name: name.trim(),
        description: description.trim(),
        category,
        privacy,
        rules: rules.trim() || undefined,
        welcome_message: welcomeMessage.trim() || undefined,
      },
      {
        onSuccess: (newCircle) => {
          navigation.goBack();
        },
        onError: (err: any) => {
          Alert.alert('Unable to form circle', err?.message || 'Please verify your network and try again.');
        },
      }
    );
  };

  return (
    <ScreenWrapper style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => navigation.goBack()}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={colors.textPrimary} />
          </TouchableOpacity>

          <Typography variant="body" weight="bold" color={colors.textPrimary}>
            Form a Community Sanctuary
          </Typography>

          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Circle Name */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Typography variant="caption" weight="bold" color={colors.textSecondary}>
                SANCTUARY NAME
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {name.length}/50
              </Typography>
            </View>
            <TextInput
              value={name}
              onChangeText={(text) => setName(text.slice(0, 50))}
              placeholder="e.g. Quiet Solitude & Tea"
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>

          {/* Section: Category Selector */}
          <View style={styles.fieldSection}>
            <Typography variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
              CHOOSE SANCTUARY SPHERE
            </Typography>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    activeOpacity={0.8}
                    onPress={() => setCategory(cat)}
                    style={[
                      styles.categoryChip,
                      isSelected && styles.categoryChipActive,
                    ]}
                  >
                    <Typography
                      variant="caption"
                      weight={isSelected ? 'bold' : 'medium'}
                      color={isSelected ? '#FFFFFF' : colors.textSecondary}
                    >
                      {cat}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Section: Description */}
          <View style={styles.fieldSection}>
            <View style={styles.labelRow}>
              <Typography variant="caption" weight="bold" color={colors.textSecondary}>
                SACRED INTENTION & PURPOSE
              </Typography>
              <Typography variant="caption" color={colors.textMuted}>
                {description.length}/500
              </Typography>
            </View>
            <TextInput
              value={description}
              onChangeText={(text) => setDescription(text.slice(0, 500))}
              placeholder="Describe who belongs here and what feelings this sanctuary holds space for..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={4}
              style={[styles.textInput, styles.textArea, { color: colors.textPrimary }]}
            />
          </View>

          {/* Section: Sanctuary Guidelines */}
          <View style={styles.fieldSection}>
            <Typography variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
              GUIDELINES & RESPECT PROTOCOLS (OPTIONAL)
            </Typography>
            <TextInput
              value={rules}
              onChangeText={setRules}
              placeholder="e.g. Gentle listening only, non-judgmental presence..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
              style={[styles.textInput, styles.textAreaSmall, { color: colors.textPrimary }]}
            />
          </View>

          {/* Section: Welcome Message */}
          <View style={styles.fieldSection}>
            <Typography variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
              WELCOME BLESSING (OPTIONAL)
            </Typography>
            <TextInput
              value={welcomeMessage}
              onChangeText={setWelcomeMessage}
              placeholder="A gentle welcome note shown to souls when they join..."
              placeholderTextColor={colors.textMuted}
              style={[styles.textInput, { color: colors.textPrimary }]}
            />
          </View>

          {/* Section: Privacy Selector */}
          <View style={styles.fieldSection}>
            <Typography variant="caption" weight="bold" color={colors.textSecondary} style={styles.sectionLabel}>
              SANCTUARY ACCESS & PRIVACY
            </Typography>
            {PRIVACY_OPTIONS.map((opt) => {
              const isSelected = privacy === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.8}
                  onPress={() => setPrivacy(opt.id as any)}
                  style={[
                    styles.privacyCard,
                    isSelected && styles.privacyCardSelected,
                  ]}
                >
                  <View style={styles.privacyIconWrap}>
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={isSelected ? colors.primaryLight : colors.textMuted}
                    />
                  </View>
                  <View style={styles.privacyTextWrap}>
                    <Typography variant="bodySmall" weight="bold" color={colors.textPrimary}>
                      {opt.title}
                    </Typography>
                    <Typography variant="caption" color={colors.textMuted}>
                      {opt.desc}
                    </Typography>
                  </View>
                  <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Action CTA */}
          <Button
            title={isPending ? 'Forming Sanctuary...' : 'Form Community Sanctuary'}
            onPress={handleCreate}
            loading={isPending}
            disabled={name.trim().length < 2 || description.trim().length < 10}
            variant="primary"
            style={styles.submitBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  closeBtn: {
    padding: 6,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 50,
  },
  fieldSection: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    height: 70,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.round,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryLight,
  },
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
    marginBottom: 8,
  },
  privacyCardSelected: {
    borderColor: theme.colors.primaryLight,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  privacyIconWrap: {
    marginRight: 12,
  },
  privacyTextWrap: {
    flex: 1,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: theme.colors.primaryLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primaryLight,
  },
  submitBtn: {
    marginTop: 10,
  },
});
