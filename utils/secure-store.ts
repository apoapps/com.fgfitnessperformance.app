import { Platform } from 'react-native';

/**
 * Supabase-compatible storage adapter.
 *
 * Priority:
 * 1. expo-secure-store (iOS Keychain / Android Keystore) — requires dev build
 * 2. AsyncStorage fallback — works in Expo Go during development
 * 3. localStorage — web builds
 */

const webStorage = {
  getItem: (key: string) => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  },
  removeItem: (key: string) => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  },
};

/**
 * Try to load expo-secure-store. Falls back to AsyncStorage if the native
 * module isn't linked (e.g. running inside Expo Go).
 */
function createNativeStorage() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const SecureStore = require('expo-secure-store');
    // Probe: calling getItemAsync on a non-existent key to verify native module works
    SecureStore.getItemAsync('__probe__');

    return {
      getItem: (key: string) => SecureStore.getItemAsync(key),
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  } catch {
    // SecureStore native module not available — fall back to AsyncStorage
    if (__DEV__) {
      console.warn(
        '[secure-store] expo-secure-store not available, using AsyncStorage fallback. ' +
        'Run `npx expo prebuild` and use a development build for production-grade storage.'
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: (key: string) => AsyncStorage.getItem(key),
      setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
      removeItem: (key: string) => AsyncStorage.removeItem(key),
    };
  }
}

export const secureStorage = Platform.OS === 'web' ? webStorage : createNativeStorage();
