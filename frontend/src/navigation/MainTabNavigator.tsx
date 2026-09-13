import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { MainTabParamList } from './types';
import { HomeNavigator } from './HomeNavigator';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { haptics } from '@/theme/haptics';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EmptyScreen = () => <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;

interface CenterFabButtonProps {
  onPress: () => void;
}

const CenterFabButton: React.FC<CenterFabButtonProps> = ({ onPress }) => {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, theme.springs.snappy);
    haptics.medium();
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, theme.springs.bouncy);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.centerBtnContainer}
    >
      <Animated.View style={[styles.centerFab, animatedStyle]}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
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
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(22, 17, 34, 0.94)',
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          position: 'absolute',
          elevation: 8,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView
              tint="dark"
              intensity={45}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
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
            <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
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
            backgroundColor: theme.colors.secondary,
            color: '#FFFFFF',
            fontSize: 10,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={22}
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
              size={22}
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
            <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  centerBtnContainer: {
    top: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerFab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow(theme.colors.primary, 0.5),
    borderWidth: 2.5,
    borderColor: theme.colors.background,
  },
});
