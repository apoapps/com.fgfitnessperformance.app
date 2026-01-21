import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { WorkoutProvider } from '@/contexts/WorkoutContext';
import { NutritionProvider } from '@/contexts/NutritionContext';
import { ChatProvider } from '@/contexts/ChatContext';
import '../global.css';

function RootLayoutContent() {
  const { isDark } = useTheme();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="chat"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="exercise"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <WorkoutProvider>
            <NutritionProvider>
              <ChatProvider>
                <RootLayoutContent />
              </ChatProvider>
            </NutritionProvider>
          </WorkoutProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
