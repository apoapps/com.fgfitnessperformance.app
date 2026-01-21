import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn, isAuthenticated, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    setLocalLoading(true);
    clearError();

    await signIn(email.trim(), password);
    setLocalLoading(false);
  };

  const isSubmitting = localLoading || isLoading;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            {/* Logo placeholder */}
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: colors.primary,
                borderRadius: 16,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text variant="hero" color="textOnPrimary" style={{ fontSize: 32 }}>
                FG
              </Text>
            </View>

            <Text variant="titleLg" uppercase>
              FG Fitness
            </Text>
            <View
              style={{
                width: 48,
                height: 4,
                backgroundColor: colors.primary,
                marginTop: 8,
              }}
            />
            <Text variant="body" color="textMuted" style={{ marginTop: 8 }}>
              Performance
            </Text>
          </View>

          {/* Login Form */}
          <Card variant="glass">
            <View style={{ gap: 20 }}>
              <Text variant="title" style={{ textAlign: 'center' }}>
                Iniciar Sesión
              </Text>

              {/* Error Message */}
              {error && (
                <View
                  style={{
                    backgroundColor: colors.dangerDim,
                    borderRadius: 8,
                    padding: 12,
                    borderWidth: 1,
                    borderColor: colors.danger,
                  }}
                >
                  <Text variant="bodySm" style={{ color: colors.danger }}>
                    {error}
                  </Text>
                </View>
              )}

              <Input
                label="Email"
                placeholder="tu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isSubmitting}
              />

              <Input
                label="Contraseña"
                placeholder="Tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isSubmitting}
              />

              <Button
                title="INICIAR SESIÓN"
                variant="primary"
                onPress={handleLogin}
                loading={isSubmitting}
                disabled={!email || !password || isSubmitting}
                testID="login-button"
              />

              <Text
                variant="caption"
                color="textMuted"
                style={{ textAlign: 'center' }}
              >
                ¿Olvidaste tu contraseña? Contacta a tu entrenador.
              </Text>
            </View>
          </Card>

          {/* Footer */}
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Text variant="caption" color="textMuted">
              © 2024 FG Fitness Performance
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
