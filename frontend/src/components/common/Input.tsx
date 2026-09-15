import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  TextInputProps,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { theme } from '@/theme';
import { Typography } from './Typography';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(({
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
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const internalInputRef = useRef<TextInput>(null);
  
  const focusAnimation = useSharedValue(0);

  useImperativeHandle(ref, () => internalInputRef.current as TextInput);

  const handleContainerPress = () => {
    if (editable) {
      internalInputRef.current?.focus();
    }
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 300 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 300 });
    onBlur?.(e);
  };

  const hasError = !!error;

  const animatedBorderStyle = useAnimatedStyle(() => {
    const errorColor = theme.colors.error;
    const defaultBorderColor = theme.colors.glass.border;
    const focusedColor = theme.colors.primaryLight;
    
    return {
      borderColor: hasError 
        ? errorColor 
        : interpolateColor(
            focusAnimation.value,
            [0, 1],
            [defaultBorderColor, focusedColor]
          ),
      shadowColor: focusedColor,
      shadowOpacity: interpolateColor(focusAnimation.value, [0, 1], [0, 0.4]),
    };
  });

  const Container = Platform.OS === 'android' ? View : BlurView;
  const containerProps = Platform.OS === 'android' 
    ? { style: [StyleSheet.absoluteFill, { backgroundColor: editable ? theme.colors.glass.surface : theme.colors.backgroundSecondary }] }
    : { intensity: 25, tint: 'dark' as const, style: StyleSheet.absoluteFill };

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

      <Pressable onPress={handleContainerPress} style={styles.pressableWrapper}>
        <Animated.View style={[styles.inputWrapper, animatedBorderStyle]}>
          <Container {...containerProps}>
             {Platform.OS !== 'android' && (
               <View style={[StyleSheet.absoluteFill, { backgroundColor: editable ? theme.colors.glass.surface : theme.colors.backgroundSecondary }]} />
             )}
          </Container>

          <View style={styles.contentRow} pointerEvents="box-none">
            {leftIcon && (
              <View pointerEvents="none" style={styles.iconSlotLeft}>
                {leftIcon}
              </View>
            )}

            <TextInput
              ref={internalInputRef}
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
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            ) : (
              rightIcon && (
                <View pointerEvents="none" style={styles.iconSlotRight}>
                  {rightIcon}
                </View>
              )
            )}
          </View>
        </Animated.View>
      </Pressable>

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
});

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
  },
  pressableWrapper: {
    width: '100%',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: theme.radius.md,
    minHeight: 52,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
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
