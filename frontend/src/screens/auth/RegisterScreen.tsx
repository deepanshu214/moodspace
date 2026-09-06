import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useAuthStore } from '@/stores/authStore';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuthStore();

  const handleRegister = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({
        displayName: displayName || 'New Explorer',
        email: email || 'user@moodspace.app',
      });
      setLoading(false);
      navigation.navigate('Onboarding', { screen: 'OnboardingProfile' });
    }, 600);
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <IconButton
        icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      />

      <View style={styles.header}>
        <Typography variant="h1" weight="bold">
          Begin Your Journey
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Join a mindful space where emotions are respected and shared with care.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Display Name / Pseudonym"
          placeholder="e.g. LunarTraveler"
          value={displayName}
          onChangeText={setDisplayName}
          helperText="You can use a pseudonym for privacy"
          leftIcon={<Ionicons name="person-outline" size={18} color={theme.colors.textMuted} />}
        />

        <Input
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          isPassword
          helperText="Must be at least 8 characters"
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
        />

        <Button
          title="Continue to Profile"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
          onPress={handleRegister}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="bodySmall" color={theme.colors.textSecondary}>
          Already have an account?{' '}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
          <Typography variant="bodySmall" weight="bold" color={theme.colors.primaryLight}>
            Sign In
          </Typography>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  submitBtn: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
