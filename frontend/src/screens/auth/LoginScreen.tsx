import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/types';
import { theme, shadows } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from '@/components/common/Typography';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { IconButton } from '@/components/common/IconButton';
import { Toast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';
import { GlassCard } from '@/components/common/GlassCard';
import { ScreenWrapper } from '@/components/common/ScreenWrapper';
import { AuroraBackground } from '@/components/effects/AuroraBackground';
import { useLogin } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { validation } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [forgotModalVisible, setForgotModalVisible] = useState(false);

  const loginMutation = useLogin();
  const authLogin = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    const eErr = validation.validateEmail(email);
    const pErr = validation.validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);

    if (eErr || pErr) {
      haptics.warning();
      return;
    }

    try {
      haptics.medium();
      await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });
      haptics.success();
    } catch (err: any) {
      haptics.error();
      setToastMessage(err?.message || 'Login failed. Please check your email and password.');
      setShowToast(true);
    }
  };

  const handleGuestLogin = async () => {
    haptics.selection();
    await authLogin('demo-guest-token', {
      id: 'usr-guest-1',
      email: 'guest@moodspace.app',
      displayName: 'Mindful Friend',
      auraScore: 320,
    });
  };

  return (
    <View style={[styles.outerWrapper, { backgroundColor: colors.background }]}>
      {/* Background Aurora */}
      <AuroraBackground emotion="calm" />

      <ScreenWrapper scrollable contentContainerStyle={styles.container}>
        <Toast
          visible={showToast}
          type="error"
          message={toastMessage}
          onDismiss={() => setShowToast(false)}
        />

        <IconButton
          icon={<Ionicons name="arrow-back" size={22} color={colors.textPrimary} />}
          variant="glass"
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        />

        <View style={styles.header}>
          <Typography variant="display" weight="heavy" style={{ color: colors.textPrimary }}>
            Welcome Back
          </Typography>
          <Typography variant="body" color={colors.textSecondary} style={styles.subtitle}>
            Sign in to share your feelings and connect with nearby friends.
          </Typography>
        </View>

        <GlassCard variant="default" style={styles.formCard}>
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
              leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
            />

            <TouchableOpacity
              style={styles.forgotBtn}
              activeOpacity={0.7}
              onPress={() => {
                setForgotModalVisible(true);
                haptics.light();
              }}
            >
              <Typography variant="caption" color={colors.primaryLight} weight="semibold">
                Forgot Password?
              </Typography>
            </TouchableOpacity>

            <Button
              title="Sign In"
              variant="aurora"
              fullWidth
              size="lg"
              loading={loginMutation.isPending}
              onPress={handleLogin}
              style={styles.submitBtn}
            />

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
              <Typography variant="caption" color={colors.textMuted} style={styles.dividerText}>
                OR
              </Typography>
              <View style={[styles.dividerLine, { backgroundColor: colors.glass.border }]} />
            </View>

            <Button
              title="Explore as Guest (No Login Needed)"
              variant="glass"
              fullWidth
              size="lg"
              onPress={handleGuestLogin}
              style={[styles.guestBtn, { borderColor: colors.glass.borderLight }]}
            />
          </View>
        </GlassCard>

        <View style={styles.footer}>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            Don't have an account?{' '}
          </Typography>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Register');
              haptics.selection();
            }}
            activeOpacity={0.7}
          >
            <Typography variant="bodySmall" weight="bold" color={colors.primaryLight}>
              Sign Up
            </Typography>
          </TouchableOpacity>
        </View>

        {/* Forgot Password Modal */}
        <Modal
          visible={forgotModalVisible}
          title="Reset Password"
          onClose={() => setForgotModalVisible(false)}
          footer={
            <Button
              title="Got it"
              variant="primary"
              fullWidth
              onPress={() => setForgotModalVisible(false)}
            />
          }
        >
          <Typography variant="body" color={colors.textSecondary}>
            We sent a password reset link to {email || 'your registered email'}. Follow the instructions in the email to set a new password.
          </Typography>
        </Modal>
      </ScreenWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  outerWrapper: {
    flex: 1,
  },
  container: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  header: {
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 8,
    lineHeight: 22,
  },
  formCard: {
    padding: 20,
    borderRadius: 24,
  },
  form: {
    width: '100%',
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  submitBtn: {
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
  },
  guestBtn: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
});
