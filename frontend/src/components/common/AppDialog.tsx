import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Modal, Pressable } from 'react-native';
import { useTheme } from '@/context';
import { inkOnPastel } from '@/theme';
import { Typography } from '@/components/common/Typography';
import { Tactile } from '@/components/common/Tactile';
import { haptics } from '@/theme/haptics';

export interface DialogButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface DialogRequest {
  title: string;
  message?: string;
  buttons: DialogButton[];
}

type Listener = (request: DialogRequest | null) => void;

let listener: Listener | null = null;
const queue: DialogRequest[] = [];

/**
 * Drop-in replacement for `Alert.alert`.
 *
 * React Native Web ships `Alert` as a no-op (`static alert() {}`), so every
 * confirmation built on it — sign out, delete account, delete echo — silently
 * did nothing in the browser. This renders a themed dialog instead, so the same
 * call works on iOS, Android and web.
 */
export const showAlert = (title: string, message?: string, buttons?: DialogButton[]) => {
  const request: DialogRequest = {
    title,
    message,
    buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }],
  };
  if (listener) {
    listener(request);
  } else {
    // The host isn't mounted yet (early startup); replay once it is.
    queue.push(request);
  }
};

/** Mounted once near the app root so `showAlert` has somewhere to render. */
export const AppDialogHost: React.FC = () => {
  const { colors } = useTheme();
  const [request, setRequest] = useState<DialogRequest | null>(null);

  useEffect(() => {
    listener = setRequest;
    if (queue.length > 0) {
      setRequest(queue.shift()!);
    }
    return () => {
      listener = null;
    };
  }, []);

  const dismiss = useCallback(
    (button?: DialogButton) => {
      setRequest(null);
      button?.onPress?.();
    },
    []
  );

  if (!request) return null;

  const cancelButton = request.buttons.find((b) => b.style === 'cancel');

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      // Android back / web escape should behave like tapping Cancel.
      onRequestClose={() => dismiss(cancelButton)}
    >
      <Pressable
        style={styles.backdrop}
        onPress={() => cancelButton && dismiss(cancelButton)}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      >
        <Pressable onPress={() => {}} style={styles.centerWrap}>
          <Tactile offset={6} radius={24} contentStyle={styles.card} style={styles.cardOuter}>
            <Typography variant="h3" style={{ color: colors.textPrimary }}>
              {request.title}
            </Typography>
            {!!request.message && (
              <Typography variant="bodySmall" style={{ color: colors.textSecondary, marginTop: 8 }}>
                {request.message}
              </Typography>
            )}

            <View style={styles.actions}>
              {request.buttons.map((button) => {
                const destructive = button.style === 'destructive';
                const cancel = button.style === 'cancel';
                return (
                  <Tactile
                    key={button.text}
                    offset={2}
                    radius={14}
                    backgroundColor={destructive ? colors.error : cancel ? colors.surface : colors.primary}
                    style={styles.actionOuter}
                    contentStyle={styles.action}
                    onPress={() => {
                      haptics.light();
                      dismiss(button);
                    }}
                    accessibilityLabel={button.text}
                  >
                    <Typography
                      variant="button"
                      numberOfLines={1}
                      style={{ color: cancel ? colors.textPrimary : destructive ? '#FFFFFF' : inkOnPastel }}
                    >
                      {button.text}
                    </Typography>
                  </Tactile>
                );
              })}
            </View>
          </Tactile>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerWrap: {
    width: '100%',
    maxWidth: 420,
  },
  cardOuter: {
    width: '100%',
  },
  card: {
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  actionOuter: {
    marginLeft: 10,
  },
  action: {
    minHeight: 44,
    minWidth: 96,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
