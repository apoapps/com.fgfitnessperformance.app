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
        // Read deep link and last tab in parallel (saves ~50-100ms)
        const [deepLink, lastTab] = await Promise.all([
          loadPendingDeepLink(),
          AsyncStorage.getItem(LAST_TAB_KEY).catch(() => null),
        ]);

        if (deepLink) {
          const tab = resolveTabFromPath(deepLink);
          router.replace(tab as Href);
          return;
        }

        const targetTab = (lastTab && VALID_TABS.includes(lastTab)) ? lastTab : 'dashboard';
        router.replace(`/(tabs)/${targetTab}` as Href);
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
