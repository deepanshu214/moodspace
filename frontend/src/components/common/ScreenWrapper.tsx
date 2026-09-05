import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from '@/theme';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  edges?: Edge[];
  backgroundColor?: string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenWrapper: React.FC<ScreenWrapperProps> = ({
  children,
  scrollable = false,
  edges = ['top', 'left', 'right'],
  backgroundColor = theme.colors.background,
  style,
  contentContainerStyle,
}) => {
  const content = scrollable ? (
    <ScrollView
      style={[styles.scroll, style]}
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.container, style]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
});
