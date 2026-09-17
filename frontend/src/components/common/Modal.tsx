import React, { useEffect } from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';
import { useTheme } from '@/context';
import { Typography } from './Typography';
import { IconButton } from './IconButton';
import { Ionicons } from '@expo/vector-icons';

export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  dismissible?: boolean;
  style?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  footer,
  dismissible = true,
  style,
}) => {
  const { colors } = useTheme();
  const translateY = useSharedValue(1000);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, theme.springs.molasses);
    } else {
      opacity.value = withTiming(0, { duration: 250 });
      translateY.value = withSpring(1000, theme.springs.snappy);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const Overlay = Platform.OS === 'android' ? View : BlurView;
  const overlayProps = Platform.OS === 'android'
    ? { style: [styles.overlay, { backgroundColor: 'rgba(0,0,0,0.7)' }] }
    : { intensity: 30, tint: 'dark' as const, style: styles.overlay };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <Overlay {...overlayProps}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.dialogCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }, animatedStyle, style]}>
              {(title || dismissible) && (
                <View style={styles.header}>
                  <Typography variant="h3" weight="semibold" style={styles.headerTitle}>
                    {title || ''}
                  </Typography>
                  {dismissible && (
                    <IconButton
                      icon={<Ionicons name="close" size={20} color={colors.textSecondary} />}
                      size="sm"
                      variant="ghost"
                      onPress={onClose}
                    />
                  )}
                </View>
              )}

              <View style={styles.body}>{children}</View>

              {footer && <View style={styles.footer}>{footer}</View>}
            </Animated.View>
          </TouchableWithoutFeedback>
        </Overlay>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    padding: theme.spacing.xl,
    ...theme.shadows.elevated,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    flex: 1,
  },
  body: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    marginTop: theme.spacing.sm,
  },
});
