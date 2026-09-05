import React, { useState } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  isPassword = false,
  secureTextEntry,
  style,
  onFocus,
  onBlur,
  editable = true,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const hasError = !!error;

  const getBorderColor = (): string => {
    if (hasError) return theme.colors.error;
    if (isFocused) return theme.colors.primary;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Typography
          variant="bodySmall"
          weight="medium"
          color={hasError ? theme.colors.error : theme.colors.textSecondary}
          style={styles.label}
        >
          {label}
        </Typography>
      )}

      <View
        style={[
          styles.inputWrapper,
          {
            borderColor: getBorderColor(),
            backgroundColor: editable ? theme.colors.surface : theme.colors.backgroundSecondary,
          },
          isFocused && styles.focusedGlow,
        ]}
      >
        {leftIcon && <View style={styles.iconSlotLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.textInput,
            {
              color: editable ? theme.colors.textPrimary : theme.colors.textDisabled,
              fontFamily: theme.typography.fontFamily,
            },
            style,
          ]}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={editable}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={styles.iconSlotRight}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        ) : (
          rightIcon && <View style={styles.iconSlotRight}>{rightIcon}</View>
        )}
      </View>

      {error ? (
        <Typography variant="caption" color={theme.colors.error} style={styles.feedbackText}>
          {error}
        </Typography>
      ) : helperText ? (
        <Typography variant="caption" color={theme.colors.textMuted} style={styles.feedbackText}>
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: theme.radius.md,
    minHeight: 50,
    paddingHorizontal: theme.spacing.md,
  },
  focusedGlow: {
    borderColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: theme.spacing.sm,
  },
  iconSlotLeft: {
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSlotRight: {
    marginLeft: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackText: {
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
});
