import { Stack } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

export default function WorkoutLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
