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
import * as WebBrowser from 'expo-web-browser';
import { Text, Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';

// Logos - horizontal with text (already includes "FG Fitness Performance" text)
const LogoHBlanco = require('../../assets/logo-h-blanco.svg');
const LogoHNegro = require('../../assets/logo-h-negro.svg');

const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://prod.fgfitnessperformance.com').replace(/\/$/, '');

/** Generate UUID v4 using Web Crypto API (available in Hermes since RN 0.73+). */
function generateUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Manual UUID v4 fallback for older engines
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function LoginScreen() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  /**
   * Standard auth flow using ASWebAuthenticationSession (iOS) / Custom Chrome Tabs (Android).
   *
   * 1. Generate random state for CSRF protection
   * 2. Open web login in native auth browser (Turnstile works here)
   * 3. After login, web generates one-time code and redirects to /auth/mobile/complete
   * 4. ASWebAuthenticationSession captures the redirect URL
   * 5. Exchange code for session tokens via POST to /api/auth/mobile/exchange
   * 6. Set session in Supabase client
   */
  const handleLogin = async () => {
    if (!email || !password) return;

    clearError();
    setLocalError(null);
    setLocalLoading(true);

    try {
      // Generate random state for CSRF protection
      const state = generateUUID();

      // Build login URL with mobile flag and state
      const loginUrl = `${WEB_APP_URL}/login?mobile=1&state=${encodeURIComponent(state)}`;

      // The redirect URL that ASWebAuthenticationSession will watch for
      const redirectUrl = `${WEB_APP_URL}/auth/mobile/complete`;

      // Open in ASWebAuthenticationSession (iOS) / Custom Chrome Tab (Android)
      // This is a REAL browser, not a WebView — Turnstile works perfectly
      const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        const returnedState = url.searchParams.get('state');

        // Verify state matches (CSRF protection)
        if (returnedState !== state) {
          setLocalError('Sesion invalida. Intenta de nuevo.');
          return;
        }

        if (!code) {
          setLocalError('No se recibio codigo de autorizacion.');
          return;
        }

        // Exchange one-time code for session tokens
        const response = await fetch(`${WEB_APP_URL}/api/auth/mobile/exchange`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setLocalError(
            errorData.message || 'Error al verificar. Intenta de nuevo.'
          );
          return;
        }

        const { access_token, refresh_token } = await response.json();

        // Set session in Supabase client (stored in SecureStore)
        const { error: sessionError } = await supabase.auth.setSession({
          access_token,
          refresh_token,
        });

        if (sessionError) {
          setLocalError('Error al establecer sesion. Intenta de nuevo.');
          return;
        }

        // AuthContext's onAuthStateChange will pick up the session
        // and redirect to dashboard
      } else if (result.type === 'cancel') {
        // User cancelled the auth flow — do nothing
      } else {
        setLocalError('No se pudo completar el inicio de sesion.');
      }
    } catch (err) {
      setLocalError('Error de conexion. Intenta de nuevo.');
    } finally {
      setLocalLoading(false);
    }
  };

  const isSubmitting = localLoading || isLoading;
  const displayError = localError || error;

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
                Iniciar Sesion
              </Text>

              {/* Error Message */}
              {displayError && (
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
                    {displayError}
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
                label="Contrasena"
                placeholder="Tu contrasena"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                editable={!isSubmitting}
              />

              <Button
                title="INICIAR SESION"
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
                El inicio de sesion se completara en el navegador.
              </Text>

              <Text
                variant="caption"
                color="textMuted"
                style={{ textAlign: 'center' }}
              >
                ¿Olvidaste tu contrasena? Contacta a tu entrenador.
              </Text>
            </View>
          </Card>

          {/* Footer */}
          <View style={{ marginTop: 32, alignItems: 'center' }}>
            <Text variant="caption" color="textMuted">
              © {currentYear} FG Fitness Performance
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
