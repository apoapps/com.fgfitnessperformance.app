import { useEffect } from 'react';
import { useRouter, usePathname, useGlobalSearchParams } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * Catch-all for unmatched routes (deep links, universal links, custom scheme).
 *
 * Maps incoming web paths to native tab routes:
 *   /app/training/*     → /(tabs)/workout
 *   /app/nutrition/*    → /(tabs)/nutrition
 *   /app/profile/*      → /(tabs)/profile
 *   /app/billing/*      → /(tabs)/profile
 *   /app/*              → /(tabs)/dashboard  (default for questionnaires, etc.)
 *   /*                  → /(tabs)/dashboard  (fallback)
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
    const tab = resolveTab(pathname);
    if (__DEV__) {
      console.log('[+not-found] Redirecting unmatched path:', pathname, '→', tab);
    }
    router.replace(tab);
  }, [pathname, router]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
