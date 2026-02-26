import { useState, useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AnimatedSplash } from '@/components/ui';
import { onAppContentReady, resetAppReady } from '@/utils/app-ready';
import { onLogoutRequested } from '@/utils/auth-bridge';
import { setPendingDeepLink } from '@/utils/deep-link-store';
import '../global.css';

/** Map a web path to the native tab route it belongs to. */
function resolveTabFromPath(path: string): string {
  const clean = path.replace(/^\/+/, '/').split('?')[0];
  if (clean.startsWith('/app/training')) return '/(tabs)/workout';
  if (clean.startsWith('/app/nutrition')) return '/(tabs)/nutrition';
  if (clean.startsWith('/app/profile') || clean.startsWith('/app/billing')) return '/(tabs)/profile';
  return '/(tabs)/dashboard';
}

function RootLayoutContent() {
  const { isDark } = useTheme();
  const { signOut } = useAuth();
  const router = useRouter();

  // Centralized logout handler — must be at root level (always mounted)
  useEffect(() => {
    return onLogoutRequested(() => {
      resetAppReady();
      signOut();
      router.replace('/(auth)/login');
    });
  }, [signOut, router]);

  // Handle foreground deep links (Issue 4)
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      try {
        const parsed = new URL(url);
        const webPath = parsed.pathname;
        if (webPath && webPath.startsWith('/app')) {
          setPendingDeepLink(webPath);
          const tab = resolveTabFromPath(webPath);
          router.replace(tab as any);
        }
      } catch {
        // Ignore malformed URLs
      }
    });
    return () => subscription.remove();
  }, [router]);

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen
          name="(auth)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="(tabs)"
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="+not-found"
          options={{
            animation: 'fade',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

// Splash shown once on cold start, never again.
// Waits for BOTH auth AND first WebView ready (if authenticated) to avoid
// intermediate spinners between splash and content (Issue 7).
function SplashController({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const readyFired = useRef(false);
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading || readyFired.current) return;

    // If not authenticated, dismiss immediately — login screen is native
    if (!isAuthenticated) {
      readyFired.current = true;
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }

    // Authenticated: wait for first WebView content ready
    const unsubscribe = onAppContentReady(() => {
      if (!readyFired.current) {
        readyFired.current = true;
        setIsReady(true);
      }
    });

    // Safety timeout: max 8s total splash time
    const safetyTimer = setTimeout(() => {
      if (!readyFired.current) {
        readyFired.current = true;
        setIsReady(true);
      }
    }, 8000);

    return () => {
      unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [isLoading, isAuthenticated]);

  if (showSplash) {
    return <AnimatedSplash isReady={isReady} onComplete={() => setShowSplash(false)} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SplashController>
          <RootLayoutContent />
        </SplashController>
      </AuthProvider>
    </ThemeProvider>
  );
}
