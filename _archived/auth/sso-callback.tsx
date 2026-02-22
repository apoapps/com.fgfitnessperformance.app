import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/utils/supabase';

export default function SsoCallbackScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    access_token?: string;
    refresh_token?: string;
  }>();
  const [message, setMessage] = useState('Conectando sesión...');

  useEffect(() => {
    const run = async () => {
      if (!params.access_token || !params.refresh_token) {
        setMessage('No recibimos credenciales válidas.');
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: params.access_token,
        refresh_token: params.refresh_token,
      });

      if (error) {
        setMessage('No fue posible iniciar sesión.');
        return;
      }

      router.replace('/(tabs)/dashboard');
    };

    void run();
  }, [params.access_token, params.refresh_token, router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 12,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="bodySm" style={{ color: colors.textMuted, textAlign: 'center' }}>
        {message}
      </Text>
    </View>
  );
}
