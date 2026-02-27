import { useState, useEffect, useRef } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AnimatedSplash } from '@/components/ui';
import { onAppContentReady, onAppContentError, resetAppReady } from '@/utils/app-ready';
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

// Splash rendered as overlay so children (tabs + WebViews) load behind it.
// Previously splash replaced children, so WebViews couldn't start loading
// until the 8s safety timeout — causing the actual delay users experienced.
function SplashController({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
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

    // Show "Conectando..." after 5s if still loading
    const slowTimer = setTimeout(() => {
      if (!readyFired.current) setIsSlow(true);
    }, 5000);

    // Listen for error (all retries exhausted) — dismiss splash to show error overlay
    const unsubError = onAppContentError(() => {
      if (!readyFired.current) {
        readyFired.current = true;
        setIsReady(true);
      }
    });

    return () => {
      unsubscribe();
      unsubError();
      clearTimeout(slowTimer);
    };
  }, [isLoading, isAuthenticated]);

  return (
    <>
      {children}
      {showSplash && (
        <AnimatedSplash
          isReady={isReady}
          isSlow={isSlow}
          onComplete={() => setShowSplash(false)}
        />
      )}
    </>
  );
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
