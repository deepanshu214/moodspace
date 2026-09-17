import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { Toast } from '@/components/common/Toast';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useRegister } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { validation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2000-01-15');

  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [dobError, setDobError] = useState<string | null>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const registerMutation = useRegister();
  const { setUser } = useAuthStore();

  const handleRegister = async () => {
    const nErr = validation.validateDisplayName(displayName);
    const eErr = validation.validateEmail(email);
    const pErr = validation.validatePassword(password);
    const dErr = validation.validateDOB(dateOfBirth);

    setNameError(nErr);
    setEmailError(eErr);
    setPasswordError(pErr);
    setDobError(dErr);

    if (nErr || eErr || pErr || dErr) {
      return;
    }

    try {
      const response = await registerMutation.mutateAsync({
        display_name: displayName.trim(),
        email: email.trim(),
        password,
        date_of_birth: dateOfBirth.trim(),
      });

      await setUser({
        id: response.id,
        email: response.email,
        displayName: response.display_name,
        dateOfBirth: response.date_of_birth,
      });

      navigation.navigate('Onboarding', { screen: 'OnboardingProfile' });
    } catch (err: any) {
      setToastMessage(err?.message || 'Registration failed. Please verify your details.');
      setShowToast(true);
    }
  };

  return (
    <ScreenWrapper scrollable contentContainerStyle={styles.container}>
      <Toast
        visible={showToast}
        type="error"
        message={toastMessage}
        onDismiss={() => setShowToast(false)}
      />

      <IconButton
        icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      />

      <View style={styles.header}>
        <Typography variant="h1" weight="bold">
          Begin Your Journey
        </Typography>
        <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Join a mindful space where emotions are respected and shared with care.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Display Name / Pseudonym"
          placeholder="e.g. LunarTraveler"
          value={displayName}
          onChangeText={(val) => {
            setDisplayName(val);
            if (nameError) setNameError(null);
          }}
          error={nameError || undefined}
          helperText="You can use an anonymous pseudonym for privacy"
          leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
        />

        <Input
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (emailError) setEmailError(null);
          }}
          error={emailError || undefined}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
        />

        <Input
          label="Password"
          placeholder="••••••••"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (passwordError) setPasswordError(null);
          }}
          error={passwordError || undefined}
          isPassword
          helperText="Must be at least 8 characters"
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
        />

        <Input
          label="Date of Birth"
          placeholder="YYYY-MM-DD"
          value={dateOfBirth}
          onChangeText={(val) => {
            setDateOfBirth(val);
            if (dobError) setDobError(null);
          }}
          error={dobError || undefined}
          helperText="Must be 18+ to join community"
          leftIcon={<Ionicons name="calendar-outline" size={18} color={colors.textMuted} />}
        />

        <Button
          title="Continue to Onboarding"
          variant="primary"
          fullWidth
          size="lg"
          loading={registerMutation.isPending}
          onPress={handleRegister}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="bodySmall" color={colors.textSecondary}>
          Already have an account?{' '}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
          <Typography variant="bodySmall" weight="bold" color={colors.primaryLight}>
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
    marginBottom: theme.spacing.lg,
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
