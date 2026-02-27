/**
 * Deep link store with both in-memory cache and AsyncStorage persistence.
 *
 * When +not-found catches an unmatched route (deep link), it stores the
 * original web path here before redirecting to the correct native tab.
 * The EmbeddedWebScreen then consumes this path to navigate the WebView.
 *
 * AsyncStorage persistence ensures deep links survive app kills (cold start).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DEEP_LINK_KEY = '@fg_pending_deep_link';

let pendingPath: string | null = null;

export function setPendingDeepLink(path: string): void {
  pendingPath = path;
  AsyncStorage.setItem(DEEP_LINK_KEY, path).catch(() => {});
}

/** Read pending deep link without consuming it. */
export function peekPendingDeepLink(): string | null {
  return pendingPath;
}

export function consumePendingDeepLink(): string | null {
  const path = pendingPath;
  pendingPath = null;
  AsyncStorage.removeItem(DEEP_LINK_KEY).catch(() => {});
  return path;
}

/** Load a pending deep link from AsyncStorage on cold start. */
export async function loadPendingDeepLink(): Promise<string | null> {
  try {
    const stored = await AsyncStorage.getItem(DEEP_LINK_KEY);
    if (stored) {
      pendingPath = stored;
      await AsyncStorage.removeItem(DEEP_LINK_KEY);
    }
    return stored;
  } catch {
    return null;
  }
}
