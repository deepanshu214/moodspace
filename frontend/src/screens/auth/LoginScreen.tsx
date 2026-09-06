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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      login('mock-jwt-token', {
        id: 'usr-1',
        email: email || 'user@moodspace.app',
        displayName: 'Elena Rostova',
        auraScore: 340,
      });
      setLoading(false);
    }, 800);
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
          Welcome Back
        </Typography>
        <Typography variant="body" color={theme.colors.textSecondary} style={styles.subtitle}>
          Sign in to check in with your emotions and your community.
        </Typography>
      </View>

      <View style={styles.form}>
        <Input
          label="Email"
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
          leftIcon={<Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} />}
        />

        <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
          <Typography variant="caption" color={theme.colors.primaryLight} weight="semibold">
            Forgot Password?
          </Typography>
        </TouchableOpacity>

        <Button
          title="Sign In"
          variant="primary"
          fullWidth
          size="lg"
          loading={loading}
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
