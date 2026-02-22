import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_TAB_KEY = '@fg_last_visited_tab';
const VALID_TABS = ['dashboard', 'workout', 'nutrition', 'profile'];

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    async function navigate() {
      if (isLoading) return;

      if (isAuthenticated) {
        // Get last visited tab and validate it
        try {
          const lastTab = await AsyncStorage.getItem(LAST_TAB_KEY);
          const targetTab = (lastTab && VALID_TABS.includes(lastTab)) ? lastTab : 'dashboard';
          router.replace(`/(tabs)/${targetTab}` as Href);
        } catch {
          // If AsyncStorage fails, just go to dashboard
          router.replace('/(tabs)/dashboard');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }

    navigate();
  }, [isAuthenticated, isLoading, router]);

  // Show loading while checking auth state
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
