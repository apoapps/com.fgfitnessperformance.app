/**
 * Centralized auth event coordinator for multiple WebViews.
 *
 * Problem: 4 eagerly-loaded WebViews each detect /login navigation or auth failure
 * independently, causing race conditions during logout.
 *
 * Solution: Singleton that debounces logout requests — only the first call triggers
 * the actual signOut. WebViews register their refs so they can all be reloaded
 * after re-authentication.
 */

import type { RefObject } from 'react';
import type WebView from 'react-native-webview';

type LogoutCallback = (source: string) => void;

let _logoutRequested = false;
let _logoutCallback: LogoutCallback | null = null;
const _webViews = new Map<string, RefObject<WebView | null>>();

/** Request a centralized logout. Only the first call within a 2s window triggers. */
export function requestLogout(source: string): void {
  if (_logoutRequested) return;
  _logoutRequested = true;

  if (__DEV__) {
    console.log('[auth-bridge] Logout requested by:', source);
  }

  _logoutCallback?.(source);

  // Reset guard after navigation settles
  setTimeout(() => {
    _logoutRequested = false;
  }, 2000);
}

/** Whether a logout is currently in progress (debounce window). */
export function isLogoutInProgress(): boolean {
  return _logoutRequested;
}

/** Register a callback for when any WebView triggers logout. */
export function onLogoutRequested(cb: LogoutCallback): () => void {
  _logoutCallback = cb;
  return () => {
    if (_logoutCallback === cb) _logoutCallback = null;
  };
}

/** Register a WebView ref so it can be reloaded after re-auth. */
export function registerWebView(id: string, ref: RefObject<WebView | null>): void {
  _webViews.set(id, ref);
}

/** Unregister a WebView ref on unmount. */
export function unregisterWebView(id: string): void {
  _webViews.delete(id);
}

/** Force all registered WebViews to reload (e.g. after re-authentication). */
export function reloadAllWebViews(): void {
  if (__DEV__) {
    console.log('[auth-bridge] Reloading all WebViews:', [..._webViews.keys()]);
  }
  for (const [, ref] of _webViews) {
    ref.current?.reload();
  }
}
