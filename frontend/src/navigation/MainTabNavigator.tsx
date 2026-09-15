import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList } from './types';
import { HomeNavigator } from './HomeNavigator';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { theme, colors, springs, shadows } from '@/theme';
import { haptics } from '@/theme/haptics';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EmptyScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

interface CenterFabButtonProps {
  onPress: () => void;
}

const CenterFabButton: React.FC<CenterFabButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, springs.stiff);
    haptics.medium();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springs.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.35,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.centerBtnContainer}
    >
      {/* Outer ambient glow pulse */}
      <Animated.View style={[styles.centerFabGlow, pulseAnimatedStyle]} />
      <Animated.View style={[styles.centerFab, animatedStyle]}>
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerFabGradient}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primaryLight,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(15, 16, 25, 0.92)',
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: colors.glass.borderLight,
          borderRadius: 32,
          marginHorizontal: 14,
          marginBottom: Platform.OS === 'ios' ? 24 : 14,
          height: Platform.OS === 'ios' ? 76 : 66,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 16 : 8,
          position: 'absolute',
          elevation: 12,
          ...shadows.glassGlow(colors.primary, 0.15),
          overflow: 'hidden',
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={40}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      {/* 1. HOME / MAP */}
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 2. NOTIFICATIONS */}
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarBadge: 3,
          tabBarBadgeStyle: {
            backgroundColor: colors.secondary,
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: 'bold',
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            lineHeight: 14,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 3. CENTER CREATE BUTTON */}
      <Tab.Screen
        name="CreateBubbleTab"
        component={EmptyScreen}
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarButton: () => (
            <CenterFabButton
              onPress={() => (navigation as any).navigate('CreateBubbleModal')}
            />
          ),
        })}
      />

      {/* 4. CHATS */}
      <Tab.Screen
        name="ChatsTab"
        component={ChatNavigator}
        options={{
          tabBarLabel: 'Echoes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              size={21}
              color={color}
            />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Aura',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerBtnContainer: {
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
    width: 58,
    height: 58,
  },
  centerFabGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
  },
  centerFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...shadows.glow(colors.primary, 0.6),
  },
  centerFabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
