import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWebViewAuth } from '@/hooks/useWebViewAuth';
import { parseBridgeMessage, buildInjectedMessage } from '@/utils/bridge';
import { consumePendingDeepLink } from '@/utils/deep-link-store';
import { requestLogout, isLogoutInProgress, registerWebView, unregisterWebView } from '@/utils/auth-bridge';
import { onTabReset } from '@/utils/tab-events';
import { setAppContentReady } from '@/utils/app-ready';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface EmbeddedWebScreenProps {
  path: string;
  title: string;
  /** Tab name for tab-reset events (e.g. 'dashboard', 'workout'). */
  tabName?: string;
}

/** Routes with dark hero sections — dark status bar background. */
const HERO_ROUTES = new Set(['/app']);

/** Video embed domains allowed to load inside iframes. */
const ALLOWED_EMBED_DOMAINS = [
  'youtube.com',
  'www.youtube.com',
  'youtube-nocookie.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
];

/** Map web tab root paths → Expo Router native tab routes. */
const TAB_PATH_TO_NATIVE: Array<{ prefix: string; exact?: boolean; nativeRoute: string }> = [
  { prefix: '/app', exact: true, nativeRoute: '/(tabs)/dashboard' },
  { prefix: '/app/training', nativeRoute: '/(tabs)/workout' },
  { prefix: '/app/nutrition', nativeRoute: '/(tabs)/nutrition' },
  { prefix: '/app/profile', nativeRoute: '/(tabs)/profile' },
  { prefix: '/app/billing', nativeRoute: '/(tabs)/profile' },
  { prefix: '/app/schedule', nativeRoute: '/(tabs)/dashboard' },
  { prefix: '/app/questionnaires', nativeRoute: '/(tabs)/dashboard' },
];

/** Resolve a web path to the native tab it belongs to. Returns null for sub-routes (e.g. questionnaires). */
function getNativeTabForPath(webPath: string): string | null {
  for (const entry of TAB_PATH_TO_NATIVE) {
    if (entry.exact) {
      if (webPath === entry.prefix || webPath === entry.prefix + '/') return entry.nativeRoute;
    } else {
      if (webPath === entry.prefix || webPath.startsWith(entry.prefix + '/')) return entry.nativeRoute;
    }
  }
  return null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/** Tab bar height — must match tabBarStyle.height in (tabs)/_layout.tsx */
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 68;

const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://prod.fgfitnessperformance.com').replace(/\/$/, '');

// ---------------------------------------------------------------------------
// Bootstrap JS (injected before content loads)
// ---------------------------------------------------------------------------

const EMBED_BOOTSTRAP_JS = `
(() => {
  const post = (payload) => {
    try {
      window.ReactNativeWebView?.postMessage(JSON.stringify(payload));
    } catch (_) {}
  };

  // Mark as embedded immediately so CSS hides web navbar/tabbar before React hydration
  document.documentElement.classList.add('app-embedded');

  // Set server-readable cookie so Next.js SSR never renders web chrome at all
  document.cookie = 'fg_embed=1; path=/app; SameSite=Lax; max-age=86400';

  const ensureViewport = () => {
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      document.head.appendChild(viewport);
    }
    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  };

  const style = document.createElement('style');
  style.textContent = [
    'html, body {',
    '  -webkit-text-size-adjust: 100% !important;',
    '  touch-action: pan-x pan-y !important;',
    '  overscroll-behavior: none;',
    '  -webkit-user-select: none;',
    '  user-select: none;',
    '  -webkit-touch-callout: none;',
    '}',
    'input, textarea, [contenteditable="true"] {',
    '  -webkit-user-select: text;',
    '  user-select: text;',
    '  -webkit-touch-callout: default;',
    '}',
    'a, img, button {',
    '  -webkit-touch-callout: none !important;',
    '  -webkit-user-drag: none;',
    '}',
    'input, textarea, select {',
    '  font-size: 16px !important;',
    '}',
    '* { -webkit-tap-highlight-color: transparent; }'
  ].join('\\n');

  // Block pinch-to-zoom gestures
  document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gesturechange', (e) => e.preventDefault(), { passive: false });
  document.addEventListener('gestureend', (e) => e.preventDefault(), { passive: false });

  // Block multi-touch zoom (2+ fingers)
  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) e.preventDefault();
  }, { passive: false });

  // Re-enforce viewport after Next.js hydration overrides it
  const enforceViewport = () => {
    const vp = document.querySelector('meta[name="viewport"]');
    if (vp) vp.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
  };
  const vpObserver = new MutationObserver(enforceViewport);
  if (document.head) {
    vpObserver.observe(document.head, { childList: true, subtree: true, attributes: true });
  }

  if (document.head) {
    ensureViewport();
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      ensureViewport();
      document.head.appendChild(style);
    }, { once: true });
  }

  // Scroll focused inputs into view when keyboard appears (Issue 8)
  document.addEventListener('focusin', (e) => {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  });

  // Listen for messages from native (AUTH_SESSION, AUTH_LOGOUT, NAVIGATE_TO)
  window.addEventListener('message', (event) => {
    try {
      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
      if (!msg || msg.v !== 2) return;

      if (msg.type === 'AUTH_SESSION' && msg.access_token && msg.refresh_token) {
        window.dispatchEvent(new CustomEvent('native-auth-session', {
          detail: { access_token: msg.access_token, refresh_token: msg.refresh_token }
        }));
      }

      if (msg.type === 'AUTH_LOGOUT') {
        window.dispatchEvent(new CustomEvent('native-auth-logout'));
      }

      if (msg.type === 'NAVIGATE_TO' && msg.path) {
        window.location.href = msg.path;
      }

      if (msg.type === 'NAVIGATE_BACK') {
        history.back();
      }
    } catch (_) {}
  });

  const emitRoute = () => post({ v: 2, type: 'WEBVIEW_ROUTE', path: window.location.pathname + window.location.search });
  const emitReady = () => post({ v: 2, type: 'WEBVIEW_READY', path: window.location.pathname + window.location.search });

  // Tab mapping — mirrors native TAB_PATH_TO_NATIVE for cross-tab detection
  const TAB_ROOTS = [
    { p: '/app', exact: true, t: 'dashboard' },
    { p: '/app/training', t: 'workout' },
    { p: '/app/nutrition', t: 'nutrition' },
    { p: '/app/profile', t: 'profile' },
    { p: '/app/billing', t: 'profile' },
    { p: '/app/schedule', t: 'dashboard' },
    { p: '/app/questionnaires', t: 'dashboard' },
  ];
  function getTab(path) {
    for (var i = 0; i < TAB_ROOTS.length; i++) {
      var r = TAB_ROOTS[i];
      if (r.exact ? (path === r.p || path === r.p + '/') : (path === r.p || path.startsWith(r.p + '/')))
        return r.t;
    }
    return null;
  }

  const wrapHistory = () => {
    const push = history.pushState;
    const replace = history.replaceState;
    let lastPath = window.location.pathname;

    history.pushState = function() {
      push.apply(this, arguments);
      const newPath = window.location.pathname;
      if (newPath !== lastPath) {
        lastPath = newPath;
      }
      emitRoute();
    };
    history.replaceState = function() {
      replace.apply(this, arguments);
      lastPath = window.location.pathname;
      emitRoute();
    };
    window.addEventListener('popstate', () => {
      const newPath = window.location.pathname;
      if (newPath !== lastPath) {
        lastPath = newPath;
      }
      emitRoute();
    });

    // Listen for NAVIGATE_REPLACE from native (cross-tab revert via replaceState)
    window.addEventListener('message', (event) => {
      try {
        const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (msg && msg.v === 2 && msg.type === 'NAVIGATE_REPLACE' && msg.path) {
          replace.call(history, null, '', msg.path);
          lastPath = msg.path;
        }
      } catch (_) {}
    });
  };

  wrapHistory();

  // Wait for full page load (HTML + CSS + images) before signaling ready.
  // This keeps the native loading overlay until content is 100% rendered.
  function emitWhenReady() {
    requestAnimationFrame(() => { emitReady(); emitRoute(); });
  }
  if (document.readyState === 'complete') {
    emitWhenReady();
  } else {
    window.addEventListener('load', emitWhenReady, { once: true });
  }
})();
true;
`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function track(event: string, meta: Record<string, string>) {
  if (__DEV__) {
    console.info(`[track] ${event}`, meta);
  }
}

const HAPTIC_MAP: Record<string, Haptics.ImpactFeedbackStyle> = {
  light: Haptics.ImpactFeedbackStyle.Light,
  medium: Haptics.ImpactFeedbackStyle.Medium,
  heavy: Haptics.ImpactFeedbackStyle.Heavy,
};

/** Strip query string from a path for route matching. */
function stripQuery(path: string): string {
  const i = path.indexOf('?');
  return i >= 0 ? path.substring(0, i) : path;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmbeddedWebScreen({ path, title, tabName }: EmbeddedWebScreenProps) {
  const { colors } = useTheme();
  const { isAuthenticated, signOut } = useAuth();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const { handleAuthMessage, injectSession, injectLogout } = useWebViewAuth(webViewRef);

  const [isFirstReady, setIsFirstReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentPath, setCurrentPath] = useState(path);

  // Auto-retry refs
  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Register/unregister WebView ref with auth-bridge (Issue 3)
  useEffect(() => {
    const id = tabName ?? title;
    registerWebView(id, webViewRef);
    return () => { unregisterWebView(id); };
  }, [tabName, title]);

  // Subscribe to tab reset events (Issue 5)
  useEffect(() => {
    if (!tabName) return;
    return onTabReset(tabName, (rootPath) => {
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(
          buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: rootPath })
        );
        // Also scroll to top
        webViewRef.current.injectJavaScript('window.scrollTo(0, 0); true;');
      }
    });
  }, [tabName]);

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // ---------- Derived header state ----------

  const cleanPath = useMemo(() => stripQuery(currentPath), [currentPath]);

  const isHeroRoute = HERO_ROUTES.has(cleanPath);

  // Background color: dark for hero routes, light otherwise
  const chromeColor = isHeroRoute ? '#0f0f12' : '#f7f7f6';

  // Swipe-back: enabled when not at the tab's root path
  const tabRootPath = useMemo(() => stripQuery(path), [path]);
  const canGoBack = cleanPath !== tabRootPath && !isHeroRoute;

  // ---------- Build source URL ----------

  const source = useMemo(() => {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL('/auth/mobile/hydrate', WEB_APP_URL);
    url.searchParams.set('embed', '1');
    url.searchParams.set('target', normalizedPath);
    url.searchParams.set('source', 'mobile');
    url.searchParams.set('screen', title.toLowerCase());
    return { uri: url.toString() };
  }, [path, title]);

  // ---------- Auth sync ----------

  useEffect(() => {
    if (!isAuthenticated) {
      injectLogout();
    }
  }, [isAuthenticated, injectLogout]);

  // ---------- Bridge message handler ----------

  const onMessage = useCallback(
    (event: WebViewMessageEvent) => {
      handleAuthMessage(event);

      const msg = parseBridgeMessage(event.nativeEvent.data);
      if (!msg) return;

      switch (msg.type) {
        case 'WEBVIEW_READY': {
          if (!isFirstReady) {
            setIsFirstReady(true);
            setAppContentReady(); // Issue 7: signal splash can dismiss
            track('webview_ready', { screen: title, path: msg.path });
          }

          // Check for pending deep link and navigate WebView to it
          const deepLink = consumePendingDeepLink();
          if (deepLink && webViewRef.current) {
            const webPath = deepLink.startsWith('/app') ? deepLink : `/app${deepLink}`;
            track('webview_deep_link', { screen: title, target: webPath });
            webViewRef.current.injectJavaScript(
              buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: webPath })
            );
          }
          break;
        }

        case 'WEBVIEW_ROUTE': {
          const newCleanPath = stripQuery(msg.path);
          const initialCleanPath = stripQuery(path);

          // Logo click in embedded mode → redirect to /app (dashboard) instead of landing
          if (newCleanPath === '/' || newCleanPath === '') {
            webViewRef.current?.injectJavaScript(
              buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: '/app' })
            );
            // Also switch to dashboard tab
            router.replace('/(tabs)/dashboard' as any);
            break;
          }

          // Detect web logout — web navigated to /login.
          // auth-bridge ensures only the first WebView triggers the actual logout.
          if (newCleanPath === '/login' || newCleanPath.startsWith('/login')) {
            requestLogout(title);
            break;
          }

          // Detect cross-tab navigation (e.g. Dashboard WebView navigates to /app/nutrition)
          const targetTab = getNativeTabForPath(newCleanPath);
          const currentTab = getNativeTabForPath(initialCleanPath);

          if (targetTab && currentTab && targetTab !== currentTab) {
            // Revert this WebView to its own tab path via replaceState (no history entry, no animation)
            webViewRef.current?.injectJavaScript(
              buildInjectedMessage({ v: 2, type: 'NAVIGATE_REPLACE', path: initialCleanPath })
            );
            // Switch native tab bar
            router.replace(targetTab as any);
            track('webview_cross_tab', { from: initialCleanPath, to: newCleanPath, nativeTab: targetTab });
            break;
          }

          setCurrentPath(msg.path);
          track('webview_route_change', { screen: title, path: msg.path });
          break;
        }

        case 'NAVIGATE':
          track('webview_navigate', { screen: title, path: msg.path });
          break;

        case 'OPEN_EXTERNAL':
          void Linking.openURL(msg.url);
          break;

        case 'HAPTIC': {
          const style = HAPTIC_MAP[msg.style];
          if (style) {
            void Haptics.impactAsync(style);
          } else if (msg.style === 'success') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else if (msg.style === 'error') {
            void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
          break;
        }

        case 'AUTH_LOGOUT_REQUEST':
          // Web user tapped logout — go straight to native logout
          track('webview_logout_request', { screen: title });
          requestLogout(title);
          break;

        case 'AUTH_NEEDED':
        case 'AUTH_EXPIRED':
        case 'AUTH_ERROR':
          // useWebViewAuth hook tries to re-inject session.
          // If native has no valid session, treat as mismatch → force logout.
          if (!isAuthenticated && !isLogoutInProgress()) {
            track('webview_auth_mismatch', { screen: title, reason: msg.type });
            requestLogout(title);
          }
          break;

        case 'OPEN_SHEET':
          track('webview_open_sheet', { screen: title, sheet: msg.sheet });
          break;

        default:
          break;
      }
    },
    [handleAuthMessage, isFirstReady, isAuthenticated, title, path, router],
  );

  // ---------- Navigation filter (allow FG domain + video embeds) ----------

  const onShouldStartLoadWithRequest = useCallback((request: WebViewNavigation) => {
    const isHttp = request.url.startsWith('http://') || request.url.startsWith('https://');
    if (!isHttp) return true;

    // Always allow FG domain
    if (request.url.includes('fgfitnessperformance.com')) return true;

    // Allow video embed domains (YouTube, Vimeo) loaded inside iframes
    if (ALLOWED_EMBED_DOMAINS.some((d) => request.url.includes(d))) return true;

    // External URL → open in system browser
    void Linking.openURL(request.url);
    return false;
  }, []);

  // ---------- Auto-retry on error ----------

  const onError = useCallback(() => {
    track('webview_error', { screen: title, path: currentPath, retry: String(retryCountRef.current) });

    if (retryCountRef.current < MAX_RETRIES) {
      retryCountRef.current += 1;
      retryTimerRef.current = setTimeout(() => {
        webViewRef.current?.reload();
      }, RETRY_DELAY_MS);
    } else {
      setIsError(true);
    }
  }, [title, currentPath]);

  const onLoadStart = useCallback(() => {
    setIsError(false);
    track('webview_load_start', { screen: title, path: currentPath });
  }, [title, currentPath]);

  const onLoadEnd = useCallback(() => {
    // Successful load — reset retry counter
    retryCountRef.current = 0;
  }, []);

  const handleManualRetry = useCallback(() => {
    setIsError(false);
    retryCountRef.current = 0;
    webViewRef.current?.reload();
  }, []);

  // ---------- Render ----------

  return (
    <View style={{ flex: 1, backgroundColor: chromeColor, paddingBottom: TAB_BAR_HEIGHT }}>
      {/* Status bar: light text on dark hero, dark text on light header */}
      {isHeroRoute && <StatusBar style="light" />}

      {/* Header is now rendered inside the web DOM (app-header component).
          This unifies header + content into a single rendering layer,
          eliminating visual tearing during iOS swipe-back gesture. */}

      {/* WebView content — full screen edge-to-edge */}
        <View style={{ flex: 1 }}>
          <WebView
            ref={webViewRef}
            source={source}
            onMessage={onMessage}
            onError={onError}
            onLoadStart={onLoadStart}
            onLoadEnd={onLoadEnd}
            injectedJavaScriptBeforeContentLoaded={EMBED_BOOTSTRAP_JS}
            javaScriptEnabled
            domStorageEnabled
            bounces={false}
            overScrollMode="never"
            setSupportMultipleWindows={false}
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            pullToRefreshEnabled={false}
            allowsBackForwardNavigationGestures={true}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            allowsFullscreenVideo
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            allowsLinkPreview={false}
            scrollEnabled
            scalesPageToFit={false}
            keyboardDisplayRequiresUserAction={false}
            style={{
              flex: 1,
              opacity: isFirstReady ? 1 : 0,
              backgroundColor: chromeColor,
            }}
          />

          {/* Loading overlay — uses background color matching splash to avoid flickering */}
          {!isFirstReady && !isError && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
              }}
            />
          )}

          {/* Error overlay — only after MAX_RETRIES auto-retries exhausted */}
          {isError && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.background,
                paddingHorizontal: 24,
                gap: 12,
              }}
            >
              <Text variant="bodyMedium" style={{ textAlign: 'center' }}>
                No pudimos cargar esta vista.
              </Text>
              <Pressable
                onPress={handleManualRetry}
                style={{
                  backgroundColor: colors.primary,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text variant="bodySm" style={{ color: '#09090b', fontWeight: '700' }}>
                  Reintentar
                </Text>
              </Pressable>
            </View>
          )}
        </View>
    </View>
  );
}
