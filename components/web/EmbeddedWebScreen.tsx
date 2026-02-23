import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from 'react-native-webview';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Text } from '@/components/ui';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWebViewAuth } from '@/hooks/useWebViewAuth';
import { parseBridgeMessage, buildInjectedMessage } from '@/utils/bridge';
import { consumePendingDeepLink } from '@/utils/deep-link-store';

// ---------------------------------------------------------------------------
// Types & constants
// ---------------------------------------------------------------------------

interface EmbeddedWebScreenProps {
  path: string;
  title: string;
}

interface PageConfig {
  title: string;
  backHref?: string;
}

/** Mirror of web's PAGE_CONFIG — routes that show a native header. */
const PAGE_CONFIG: Record<string, PageConfig> = {
  // Tab root pages (non-hero)
  '/app/nutrition': { title: 'FG NUTRITION' },
  '/app/profile': { title: 'PERFIL' },
  // Sub-routes
  '/app/billing': { title: 'FACTURACION', backHref: '/app/profile' },
  '/app/questionnaires': { title: 'CUESTIONARIOS', backHref: '/app' },
  '/app/questionnaires/training-diagnostic': { title: 'DIAGNOSTICO', backHref: '/app/questionnaires' },
  '/app/questionnaires/clinical-history': { title: 'HISTORIA CLINICA', backHref: '/app/questionnaires' },
  '/app/questionnaires/monitoring': { title: 'MONITOREO', backHref: '/app/questionnaires' },
  '/app/questionnaires/monitoring/history': { title: 'HISTORIAL', backHref: '/app/questionnaires' },
};

/** Routes under /app/training/* that need a back button to /app/training */
const TRAINING_SUB_ROUTE_PREFIX = '/app/training/exercise/';

/** Routes with dark hero sections — no native header, dark SafeArea. */
const HERO_ROUTES = new Set(['/app', '/app/training']);

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
    '  -webkit-text-size-adjust: 100%;',
    '  touch-action: manipulation;',
    '  overscroll-behavior: none;',
    '  -webkit-user-select: none;',
    '  user-select: none;',
    '  -webkit-touch-callout: none;',
    '}',
    'input, textarea, [contenteditable="true"] {',
    '  -webkit-user-select: text;',
    '  user-select: text;',
    '  -webkit-touch-callout: default;',
    '}'
  ].join('\\n');

  if (document.head) {
    ensureViewport();
    document.head.appendChild(style);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      ensureViewport();
      document.head.appendChild(style);
    }, { once: true });
  }

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
    } catch (_) {}
  });

  const emitRoute = () => post({ v: 2, type: 'WEBVIEW_ROUTE', path: window.location.pathname + window.location.search });
  const emitReady = () => post({ v: 2, type: 'WEBVIEW_READY', path: window.location.pathname + window.location.search });

  const wrapHistory = () => {
    const push = history.pushState;
    const replace = history.replaceState;
    history.pushState = function() {
      push.apply(this, arguments);
      emitRoute();
    };
    history.replaceState = function() {
      replace.apply(this, arguments);
      emitRoute();
    };
    window.addEventListener('popstate', emitRoute);
  };

  wrapHistory();

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    emitReady();
    emitRoute();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      emitReady();
      emitRoute();
    }, { once: true });
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

export function EmbeddedWebScreen({ path, title }: EmbeddedWebScreenProps) {
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

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  // ---------- Derived header state ----------

  const cleanPath = useMemo(() => stripQuery(currentPath), [currentPath]);

  const isHeroRoute = HERO_ROUTES.has(cleanPath);
  const pageConfig = PAGE_CONFIG[cleanPath];
  const isTrainingSubRoute = cleanPath.startsWith(TRAINING_SUB_ROUTE_PREFIX);
  const showNativeHeader = !isHeroRoute;
  const headerTitle = pageConfig?.title ?? (isTrainingSubRoute ? 'EJERCICIO' : title);
  const headerBackHref = pageConfig?.backHref ?? (isTrainingSubRoute ? '/app/training' : undefined);

  // Background color: dark for hero routes, light otherwise
  const chromeColor = isHeroRoute ? '#0f0f12' : '#f7f7f6';

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

  // ---------- Back navigation ----------

  const handleBack = useCallback(() => {
    if (headerBackHref && webViewRef.current) {
      webViewRef.current.injectJavaScript(
        buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: headerBackHref })
      );
    }
  }, [headerBackHref]);

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

          // Detect web logout — web navigated to /login
          if (newCleanPath === '/login' || newCleanPath.startsWith('/login')) {
            track('webview_logout_detected', { screen: title });
            signOut();
            router.replace('/(auth)/login');
            break;
          }

          // Detect cross-tab navigation (e.g. Dashboard WebView navigates to /app/nutrition)
          const targetTab = getNativeTabForPath(newCleanPath);
          const currentTab = getNativeTabForPath(initialCleanPath);

          if (targetTab && currentTab && targetTab !== currentTab) {
            // Navigate this WebView back to its own tab path so it's correct when user returns
            webViewRef.current?.injectJavaScript(
              buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: initialCleanPath })
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

        case 'AUTH_NEEDED':
        case 'AUTH_EXPIRED':
        case 'AUTH_ERROR':
          // useWebViewAuth hook already handles this by re-injecting the session.
          // Only redirect to login if there's genuinely no native session.
          if (!isAuthenticated) {
            track('webview_auth_redirect', { screen: title, reason: msg.type });
            router.replace('/(auth)/login');
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

      <SafeAreaView edges={['top']} style={{ backgroundColor: chromeColor }}>
        {showNativeHeader && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 16,
              backgroundColor: '#f7f7f6',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Back arrow — only when route has backHref */}
            {headerBackHref ? (
              <Pressable
                onPress={handleBack}
                hitSlop={8}
                style={{
                  width: 32,
                  height: 32,
                  marginLeft: -4,
                  borderRadius: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="arrow-back" size={20} color="#09090b" />
              </Pressable>
            ) : null}

            {/* Title + yellow accent bar (matches web AppHeader exactly) */}
            <View style={{ flexDirection: 'column', gap: 4 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '700',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                  color: '#09090b',
                }}
              >
                {headerTitle}
              </Text>
              <View
                style={{
                  width: 48,
                  height: 4,
                  backgroundColor: '#ffd801',
                  borderRadius: 2,
                }}
              />
            </View>
          </View>
        )}
      </SafeAreaView>

      {/* WebView content */}
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
          allowsBackForwardNavigationGestures={Platform.OS === 'ios'}
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsFullscreenVideo
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          style={{
            flex: 1,
            opacity: isFirstReady ? 1 : 0,
            backgroundColor: chromeColor,
          }}
        />

        {/* Loading overlay */}
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
              backgroundColor: chromeColor,
              gap: 10,
            }}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <Text variant="caption" style={{ color: isHeroRoute ? '#a1a1aa' : colors.textMuted }}>
              Cargando contenido...
            </Text>
          </View>
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
