import { useEffect } from 'react';
import { useRouter, usePathname } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { setPendingDeepLink } from '@/utils/deep-link-store';

/**
 * Catch-all for unmatched routes (deep links, universal links, custom scheme).
 *
 * Stores the original web path so EmbeddedWebScreen can navigate the WebView
 * to the correct page, then redirects to the native tab that owns that path.
 *
 * Web route → Native tab mapping:
 *   /app/training/*            → /(tabs)/workout
 *   /app/nutrition/*           → /(tabs)/nutrition
 *   /app/profile/*             → /(tabs)/profile
 *   /app/billing/*             → /(tabs)/profile
 *   /app/questionnaires/*      → /(tabs)/dashboard
 *   /app/*                     → /(tabs)/dashboard
 */

type TabRoute = '/(tabs)/dashboard' | '/(tabs)/workout' | '/(tabs)/nutrition' | '/(tabs)/profile';

function resolveTab(path: string): TabRoute {
  const clean = path.replace(/^\/+/, '/').split('?')[0];

  if (clean.startsWith('/app/training')) return '/(tabs)/workout';
  if (clean.startsWith('/app/nutrition')) return '/(tabs)/nutrition';
  if (clean.startsWith('/app/profile') || clean.startsWith('/app/billing')) return '/(tabs)/profile';

  return '/(tabs)/dashboard';
}

export default function NotFoundScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();

  useEffect(() => {
    // Store the full web path so the WebView can navigate to it
    setPendingDeepLink(pathname);

    const tab = resolveTab(pathname);
    if (__DEV__) {
      console.log('[+not-found] Deep link:', pathname, '→', tab);
    }
    router.replace(tab);
  }, [pathname, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
