import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

// For web, we need to handle SSR where localStorage isn't available
const getStorage = () => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined') {
      return {
        getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
        setItem: (key: string, value: string) => {
          localStorage.setItem(key, value);
          return Promise.resolve();
        },
        removeItem: (key: string) => {
          localStorage.removeItem(key);
          return Promise.resolve();
        },
      };
    }
    // SSR - return a no-op storage
    return {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };
  }
  return AsyncStorage;
};

// Web Lock API for browser environments to prevent concurrent auth operations
const webLock = Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.locks
  ? async <T>(name: string, acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
      // If acquireTimeout is 0 or negative, execute without lock to avoid immediate abort
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
        // If lock was aborted due to timeout, still try to execute the function
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
    storage: getStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // Use Web Lock API on web, no lock on native (AsyncStorage handles it)
    lock: webLock,
    // Increase timeout to prevent warnings during slow network conditions
    lockAcquireTimeout: 5000,
  },
});
