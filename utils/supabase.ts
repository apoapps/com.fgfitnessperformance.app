import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import { secureStorage } from '@/utils/secure-store';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

if (__DEV__) {
  console.log('[supabase] URL:', supabaseUrl);
  console.log('[supabase] Key prefix:', supabaseKey?.substring(0, 20) + '...');
}

// Web Lock API for browser environments to prevent concurrent auth operations
const webLock = Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.locks
  ? async <T>(name: string, acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
      if (acquireTimeout <= 0) {
        return fn();
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), acquireTimeout);

      try {
        return await navigator.locks.request(
          name,
          { signal: controller.signal },
          async () => fn()
        );
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn(`Lock "${name}" acquisition timed out after ${acquireTimeout}ms, proceeding without lock`);
          return fn();
        }
        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }
  : undefined;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Native: expo-secure-store (iOS Keychain / Android Keystore)
    // Web: localStorage with SSR fallback
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: webLock,
  },
});
