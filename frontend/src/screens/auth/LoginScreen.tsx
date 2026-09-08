import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { Toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { useLogin } from '@/hooks/useAuth';
import { validation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const loginMutation = useLogin();

  const handleLogin = async () => {
    // 1. Validate inputs
    const eErr = validation.validateEmail(email);
    const pErr = validation.validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      // On success, authStore.login() updates state, automatically navigating to Main
    } catch (err: any) {
      setToastMessage(err?.message || 'Login failed. Please check your credentials.');
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
        icon={<Ionicons name="arrow-back" size={22} color={theme.colors.textPrimary} />}
        variant="ghost"
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      />

      <View style={styles.header}>
        <Typography variant="h1" weight="bold">
          Welcome Back
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Sign in to check in with your emotions and your community.
        </Typography>
      </View>

      <View style={styles.form}>
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
          leftIcon={<Ionicons name="mail-outline" size={18} color={theme.colors.textMuted} />}
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
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
        />

        <TouchableOpacity
          style={styles.forgotBtn}
          activeOpacity={0.7}
          onPress={() => setForgotModalVisible(true)}
        >
          <Typography variant="caption" color={theme.colors.primaryLight} weight="semibold">
            Forgot Password?
          </Typography>
        </TouchableOpacity>

        <Button
          title="Sign In"
          variant="primary"
          fullWidth
          size="lg"
          loading={loginMutation.isPending}
          onPress={handleLogin}
          style={styles.submitBtn}
        />
      </View>

      <View style={styles.footer}>
        <Typography variant="bodySmall" color={theme.colors.textSecondary}>
          Don't have an account?{' '}
        </Typography>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
          <Typography variant="bodySmall" weight="bold" color={theme.colors.primaryLight}>
            Sign Up
          </Typography>
        </TouchableOpacity>
      </View>

      {/* Forgot Password Modal */}
      <Modal
        visible={forgotModalVisible}
        title="Password Reset"
        onClose={() => setForgotModalVisible(false)}
        footer={
          <Button
            title="Understood"
            variant="primary"
            fullWidth
            onPress={() => setForgotModalVisible(false)}
          />
        }
      >
        <Typography variant="body" color={theme.colors.textSecondary}>
          A password reset link will be dispatched to {email || 'your registered email'} with secure
          instructions to regain access to your emotional space.
        </Typography>
      </Modal>
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
    marginBottom: theme.spacing.xxl,
  },
  subtitle: {
    marginTop: 6,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  submitBtn: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
});
