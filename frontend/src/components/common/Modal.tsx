import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ViewStyle,
} from 'react-native';
import { theme } from '@/theme';
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
  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={dismissible ? onClose : undefined}
    >
      <TouchableWithoutFeedback onPress={dismissible ? onClose : undefined}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.dialogCard, style]}>
              {(title || dismissible) && (
                <View style={styles.header}>
                  <Typography variant="h3" weight="semibold" style={styles.headerTitle}>
                    {title || ''}
                  </Typography>
                  {dismissible && (
                    <IconButton
                      icon={<Ionicons name="close" size={20} color={theme.colors.textSecondary} />}
                      size="sm"
                      variant="ghost"
                      onPress={onClose}
                    />
                  )}
                </View>
              )}

              <View style={styles.body}>{children}</View>

              {footer && <View style={styles.footer}>{footer}</View>}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
