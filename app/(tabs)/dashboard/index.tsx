import { Button, Card, Text } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { SafeAreaView, View } from 'react-native';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { user, signOut, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1, padding: 20, gap: 24 }}>
        {/* Header */}
        <View style={{ gap: 8 }}>
        
          <View style={{ width: 48, height: 4, backgroundColor: colors.primary }} />
          <Text variant="body" color="textMuted">
            Bienvenido, {user?.email?.split('@')[0] || 'Usuario'}
          </Text>
        </View>

        {/* Placeholder Content */}
        <Card variant="glass">
          <View style={{ gap: 12, alignItems: 'center', padding: 20 }}>
            <Text variant="title">Dashboard Placeholder</Text>
            <Text variant="body" color="textMuted" style={{ textAlign: 'center' }}>
              Este es el hub principal. Las siguientes features serán implementadas:
            </Text>
            <View style={{ gap: 8, marginTop: 12 }}>
              <Text variant="bodySm" color="textMuted">• Próximo entrenamiento</Text>
              <Text variant="bodySm" color="textMuted">• Resumen de nutrición</Text>
              <Text variant="bodySm" color="textMuted">• Calendario del día</Text>
            </View>
          </View>
        </Card>

        {/* Logout Button */}
        <View style={{ marginTop: 'auto' }}>
          <Button
            title="Cerrar Sesión"
            variant="outline"
            onPress={signOut}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
