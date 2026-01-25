import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { NutritionProvider } from '@/contexts/NutritionContext';
import { ChatProvider } from '@/contexts/ChatContext';
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
          name="chat"
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom', // Fade en lugar de slide
          }}
        />
        <Stack.Screen
          name="exercise"
          options={{
            presentation: 'modal',
            animation: 'fade_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

// Componente interno que monitorea cuando el app está listo
function SplashController({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const { isLoading } = useAuth();

  // Marcar como listo cuando Auth termine de cargar
  useEffect(() => {
    if (!isLoading) {
      // Pequeño delay adicional para asegurar que todo esté hidratado
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 300);
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
          <ProfileProvider>
            <WorkoutProvider>
              <NutritionProvider>
                <ChatProvider>
                  <RootLayoutContent />
                </ChatProvider>
              </NutritionProvider>
            </WorkoutProvider>
          </ProfileProvider>
        </SplashController>
      </AuthProvider>
    </ThemeProvider>
  );
}
