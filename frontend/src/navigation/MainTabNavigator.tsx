import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { HomeNavigator } from './HomeNavigator';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EmptyScreen = () => <View style={{ flex: 1, backgroundColor: theme.colors.background }} />;

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: theme.colors.primaryLight,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          ...theme.shadows.elevated,
        },
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
          tabBarButton: (props) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => (navigation as any).navigate('CreateBubbleModal')}
              style={styles.centerBtnContainer}
            >
              <View style={styles.centerFab}>
                <Ionicons name="add" size={28} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
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
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.glow(theme.colors.primary, 0.45),
    borderWidth: 2.5,
    borderColor: theme.colors.background,
  },
});
