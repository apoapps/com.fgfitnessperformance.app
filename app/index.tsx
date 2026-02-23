import { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Href } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadPendingDeepLink, consumePendingDeepLink } from '@/utils/deep-link-store';

const LAST_TAB_KEY = '@fg_last_visited_tab';
const VALID_TABS = ['dashboard', 'workout', 'nutrition', 'profile'];

/** Map a web path to the native tab route it belongs to. */
function resolveTabFromPath(path: string): string {
  const clean = path.replace(/^\/+/, '/').split('?')[0];
  if (clean.startsWith('/app/training')) return '/(tabs)/workout';
  if (clean.startsWith('/app/nutrition')) return '/(tabs)/nutrition';
  if (clean.startsWith('/app/profile') || clean.startsWith('/app/billing')) return '/(tabs)/profile';
  return '/(tabs)/dashboard';
}

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    async function navigate() {
      if (isLoading) return;

      if (isAuthenticated) {
        // Check for persisted deep link from cold start (Issue 4)
        const deepLink = await loadPendingDeepLink();
        if (deepLink) {
          const tab = resolveTabFromPath(deepLink);
          // Re-store the path so EmbeddedWebScreen can consume it
          // (loadPendingDeepLink already moved it to in-memory)
          router.replace(tab as Href);
          return;
        }

        // Get last visited tab and validate it
        try {
          const lastTab = await AsyncStorage.getItem(LAST_TAB_KEY);
          const targetTab = (lastTab && VALID_TABS.includes(lastTab)) ? lastTab : 'dashboard';
          router.replace(`/(tabs)/${targetTab}` as Href);
        } catch {
          router.replace('/(tabs)/dashboard');
        }
      } else {
        router.replace('/(auth)/login');
      }
    }

    navigate();
  }, [isAuthenticated, isLoading, router]);

  // Plain view matching splash background — no visible spinner (Issue 7)
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    />
  );
}
