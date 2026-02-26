import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Text, Button, Card, Input } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/utils/supabase';
import { reloadAllWebViews } from '@/utils/auth-bridge';
import { CaptchaWebView, type CaptchaWebViewHandle } from '@/components/web/CaptchaWebView';

// Logos - horizontal with text (already includes "FG Fitness Performance" text)
const LogoHBlanco = require('../../assets/logo-h-blanco.svg');
const LogoHNegro = require('../../assets/logo-h-negro.svg');

const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://prod.fgfitnessperformance.com').replace(/\/$/, '');

/** Generate UUID v4 using Web Crypto API (available in Hermes since RN 0.73+). */
function generateUUID(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
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

  // Captcha state
  const captchaRef = useRef<CaptchaWebViewHandle>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaReady, setCaptchaReady] = useState(false);
  const [captchaFailed, setCaptchaFailed] = useState(false);

  const handleCaptchaToken = useCallback((token: string) => {
    setCaptchaToken(token);
    setCaptchaReady(true);
    setCaptchaFailed(false);
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    setCaptchaToken(null);
    setCaptchaReady(false);
  }, []);

  const handleCaptchaError = useCallback(() => {
    setCaptchaFailed(true);
    setCaptchaReady(false);
    setCaptchaToken(null);
  }, []);

  // Redirect if already authenticated + reload all WebViews on re-auth
  useEffect(() => {
    if (isAuthenticated) {
      reloadAllWebViews();
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated]);

  /**
   * Primary login: signInWithPassword with captcha token.
   * If captcha WebView failed to load, fall back to browser login.
   */
  const handleLogin = async () => {
    if (!email || !password) return;

    clearError();
    setLocalError(null);
    setLocalLoading(true);

    try {
      // If captcha WebView failed entirely, go to browser login
      if (captchaFailed) {
        console.log('[login] Captcha WebView failed, opening browser login...');
        await handleBrowserLogin();
        return;
      }

      console.log('[login] Attempting signInWithPassword with captchaToken...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
        options: captchaToken ? { captchaToken } : undefined,
      });

      // Reset captcha after each attempt (token is single-use)
      setCaptchaToken(null);
      setCaptchaReady(false);
      captchaRef.current?.reset();

      if (!authError && data.session) {
        console.log('[login] Login success!');
        return;
      }

      if (authError) {
        // If captcha was required but we didn't have a token, retry after token arrives
        if (authError.message?.toLowerCase().includes('captcha')) {
          console.log('[login] Captcha required, waiting for token...');
          setLocalError('Verificando... intenta de nuevo en unos segundos.');
          return;
        }

        const msg =
          authError.message === 'Invalid login credentials'
            ? 'Email o contrasena incorrectos.'
            : authError.message;
        setLocalError(msg);
      }
    } catch (err) {
      console.log('[login] Exception:', err);
      setLocalError('Error de conexion. Intenta de nuevo.');
    } finally {
      setLocalLoading(false);
    }
  };

  /**
   * Browser-based login fallback (same web login page with Turnstile).
   * Only used if the inline captcha WebView fails to load.
   */
  const handleBrowserLogin = async () => {
    const state = generateUUID();
    const loginUrl = `${WEB_APP_URL}/login?mobile=1&state=${encodeURIComponent(state)}&email=${encodeURIComponent(email.trim())}`;
    const redirectUrl = Linking.createURL('auth-complete');

    console.log('[login:browser] Opening browser login');
    const result = await WebBrowser.openAuthSessionAsync(loginUrl, redirectUrl);
    console.log('[login:browser] Browser result:', JSON.stringify(result));

    if (result.type === 'success' && result.url) {
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (returnedState !== state) {
        setLocalError('Sesion invalida. Intenta de nuevo.');
        return;
      }

      if (!code) {
        setLocalError('No se recibio codigo de autorizacion.');
        return;
      }

      const response = await fetch(`${WEB_APP_URL}/api/auth/mobile/exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setLocalError(errorData.message || 'Error al verificar. Intenta de nuevo.');
        return;
      }

      const { access_token, refresh_token } = await response.json();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        setLocalError('Error al establecer sesion. Intenta de nuevo.');
        return;
      }
    } else if (result.type === 'cancel') {
      // User cancelled
    } else {
      setLocalError('No se pudo completar el inicio de sesion.');
    }
  };

  const isSubmitting = localLoading;
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

              {/* Turnstile captcha widget */}
              <CaptchaWebView
                ref={captchaRef}
                onToken={handleCaptchaToken}
                onExpired={handleCaptchaExpired}
                onError={handleCaptchaError}
              />

              <Button
                title="INICIAR SESION"
                variant="primary"
                onPress={handleLogin}
                loading={isSubmitting}
                disabled={!email || !password || isSubmitting}
                testID="login-button"
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP_URL}/forgot-password`)}
                >
                  <Text
                    variant="caption"
                    style={{ color: colors.textMuted, textDecorationLine: 'underline' }}
                  >
                    ¿Olvidaste tu contrasena?
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => WebBrowser.openBrowserAsync(`${WEB_APP_URL}/signup`)}
                >
                  <Text
                    variant="caption"
                    style={{ color: colors.primary, textDecorationLine: 'underline' }}
                  >
                    Crear cuenta
                  </Text>
                </Pressable>
              </View>
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
