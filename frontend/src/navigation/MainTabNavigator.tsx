import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { MainTabParamList } from './types';
import { HomeNavigator } from './HomeNavigator';
import { MapScreen } from '@/screens/map/MapScreen';
import { NotificationsScreen } from '@/screens/notifications/NotificationsScreen';
import { ChatNavigator } from './ChatNavigator';
import { ProfileNavigator } from './ProfileNavigator';
import { springs } from '@/theme';
import { haptics } from '@/theme/haptics';

import { useTheme } from '@/context';
import { inkOnPastel } from '@/theme/colors';

const Tab = createBottomTabNavigator<MainTabParamList>();

const EmptyScreen = () => {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
};

interface CenterFabButtonProps {
  onPress: () => void;
}

/** The raised tangerine "+" that drops a bubble, per the Stitch tab bar. */
const CenterFabButton: React.FC<CenterFabButtonProps> = ({ onPress }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 1600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: 0.2,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, springs.stiff);
        haptics.medium();
      }}
      onPressOut={() => {
        scale.value = withSpring(1, springs.bouncy);
      }}
      accessibilityRole="button"
      accessibilityLabel="Drop a mood bubble"
      style={styles.centerBtnContainer}
    >
      <Animated.View style={[styles.centerFabGlow, pulseAnimatedStyle, { backgroundColor: colors.primary }]} />
      {/* hard ink block, then the surface — the Neo-Editorial press */}
      <View style={[styles.centerFabShadow, { backgroundColor: colors.hardShadow }]} />
      <Animated.View style={[styles.centerFab, animatedStyle, { borderColor: colors.ink }]}>
        <LinearGradient
          colors={[colors.primary, '#FB923C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerFabGradient}
        >
          <Ionicons name="add" size={28} color={inkOnPastel} />
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
};

export const MainTabNavigator: React.FC = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.accentInk,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 2,
          borderTopColor: colors.ink,
          height: Platform.OS === 'ios' ? 86 : 72,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 26 : 12,
          position: 'absolute',
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      {/* 1. MAP — the living atlas at full height */}
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 2. FEED — the Stitch home screen */}
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'layers' : 'layers-outline'} size={21} color={color} />
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
            <CenterFabButton onPress={() => (navigation as any).navigate('CreateBubbleModal')} />
          ),
        })}
      />

      {/* 4. ALERTS */}
      <Tab.Screen
        name="NotificationsTab"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* 5. PROFILE */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={21} color={color} />
          ),
        }}
      />

      {/* Chats keeps its route (reached from the feed masthead) but has no tab,
          matching the Stitch five-slot bar. */}
      <Tab.Screen
        name="ChatsTab"
        component={ChatNavigator}
        options={({ route }) => {
          // Inside a conversation the floating bar would sit on top of the
          // message composer, so it steps aside. These screens carry their own
          // back button, so nothing is stranded.
          const focused = getFocusedRouteNameFromRoute(route) ?? 'Conversations';
          const immersive = focused === 'ChatDetail' || focused === 'EchoMatch' || focused === 'IcebreakerPicker';
          return {
            tabBarButton: () => null,
            tabBarItemStyle: { display: 'none' },
            tabBarStyle: immersive ? { display: 'none' } : undefined,
          };
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
    width: 64,
    height: 64,
  },
  centerFabGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  centerFabShadow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    top: 8,
    left: 8,
  },
  centerFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
  },
  centerFabGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
