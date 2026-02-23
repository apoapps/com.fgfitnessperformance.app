import { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AnimatedSplash } from '@/components/ui';
import '../global.css';

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade', // Cambio global de slide a fade
          animationDuration: 300,
        }}
      >
        <Stack.Screen name="index" />
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

// Splash shown once on cold start, never again
function SplashController({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const readyFired = useRef(false);
  const { isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !readyFired.current) {
      readyFired.current = true;
      // Small delay so the first frame is fully rendered
      const timer = setTimeout(() => setIsReady(true), 200);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

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
