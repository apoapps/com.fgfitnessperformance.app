import React, { useState, useEffect } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

// Logos - horizontal with text (already includes "FG Fitness Performance" text)
const LogoHBlanco = require('../../assets/logo-h-blanco.svg');
const LogoHNegro = require('../../assets/logo-h-negro.svg');

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
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
          {/* Header with Logo */}
          {/* logo-h aspect ratio is 660:131 (≈5:1) */}
          <View style={{ alignItems: 'center', marginBottom: 48 }}>
            <Image
              source={isDark ? LogoHBlanco : LogoHNegro}
              style={{
                width: 300,
                aspectRatio: 660 / 131,
                marginBottom: 16,
              }}
              contentFit="contain"
            />
            <View
              style={{
                width: 48,
                height: 4,
                backgroundColor: colors.primary,
                marginTop: 8,
              }}
            />
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
