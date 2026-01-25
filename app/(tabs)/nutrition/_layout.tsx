import { Stack } from 'expo-router';

export default function NutritionLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
}
