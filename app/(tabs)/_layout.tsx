import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, usePathname } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { emitTabReset } from '@/utils/tab-events';

const LAST_TAB_KEY = '@fg_last_visited_tab';
const VALID_TABS = ['dashboard', 'workout', 'nutrition', 'profile'] as const;

/** Map tab names to their WebView root paths. */
const TAB_ROOT_PATHS: Record<string, string> = {
  dashboard: '/app',
  workout: '/app/training',
  nutrition: '/app/nutrition',
  profile: '/app/profile',
};

export default function TabLayout() {
  const { colors } = useTheme();
  const pathname = usePathname();

  // Save last visited tab when pathname changes
  useEffect(() => {
    // Extract tab name from pathname like "/(tabs)/dashboard"
    const match = pathname.match(/\(tabs\)\/(dashboard|workout|nutrition|profile)/);
    if (match && match[1]) {
      const tabName = match[1];
      if (VALID_TABS.includes(tabName as any)) {
        AsyncStorage.setItem(LAST_TAB_KEY, tabName).catch(console.error);
      }
    }
  }, [pathname]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tabBarTextActive,
        tabBarInactiveTintColor: colors.tabBarText,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        lazy: true,
        freezeOnBlur: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              emitTabReset('dashboard', TAB_ROOT_PATHS.dashboard);
            }
          },
        })}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'FG Training',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'barbell' : 'barbell-outline'}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              emitTabReset('workout', TAB_ROOT_PATHS.workout);
            }
          },
        })}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'FG Nutrition',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'restaurant' : 'restaurant-outline'}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              emitTabReset('nutrition', TAB_ROOT_PATHS.nutrition);
            }
          },
        })}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={size}
              color={color}
            />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            if (navigation.isFocused()) {
              emitTabReset('profile', TAB_ROOT_PATHS.profile);
            }
          },
        })}
      />
    </Tabs>
  );
}
