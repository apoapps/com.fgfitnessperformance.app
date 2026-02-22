import { useCallback, useRef } from 'react';
import type WebView from 'react-native-webview';
import { useAuth } from '@/contexts/AuthContext';
import { buildInjectedMessage, parseBridgeMessage } from '@/utils/bridge';
import type { WebViewMessageEvent } from 'react-native-webview';

/**
 * Hook that manages WebView auth session injection.
 *
 * Handles the bridge protocol:
 * - Listens for AUTH_NEEDED/AUTH_EXPIRED from web
 * - Injects AUTH_SESSION into WebView when needed
 * - Handles AUTH_LOGOUT when native signs out
 */
export function useWebViewAuth(webViewRef: React.RefObject<WebView | null>) {
  const { session } = useAuth();
  const hasInjectedRef = useRef(false);

  /**
   * Inject current session tokens into the WebView via postMessage.
   * Called when we receive AUTH_NEEDED or AUTH_EXPIRED from web.
   */
  const injectSession = useCallback(() => {
    if (!session?.access_token || !session?.refresh_token) return;
    if (!webViewRef.current) return;

    const js = buildInjectedMessage({
      v: 2,
      type: 'AUTH_SESSION',
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });

    webViewRef.current.injectJavaScript(js);
    hasInjectedRef.current = true;
  }, [session, webViewRef]);

  /**
   * Send logout signal to WebView.
   */
  const injectLogout = useCallback(() => {
    if (!webViewRef.current) return;

    const js = buildInjectedMessage({
      v: 2,
      type: 'AUTH_LOGOUT',
    });

    webViewRef.current.injectJavaScript(js);
    hasInjectedRef.current = false;
  }, [webViewRef]);

  /**
   * Handle bridge messages that relate to auth.
   * Returns true if the message was handled, false otherwise.
   */
  const handleAuthMessage = useCallback(
    (event: WebViewMessageEvent): boolean => {
      const msg = parseBridgeMessage(event.nativeEvent.data);
      if (!msg) return false;

      switch (msg.type) {
        case 'WEBVIEW_READY':
          // WebView is ready — inject session if we have one
          if (session?.access_token) {
            injectSession();
          }
          return false; // Don't consume — let parent also handle WEBVIEW_READY

        case 'AUTH_NEEDED':
        case 'AUTH_EXPIRED':
          injectSession();
          return true;

        default:
          return false;
      }
    },
    [session, injectSession]
  );

  return {
    injectSession,
    injectLogout,
    handleAuthMessage,
    hasInjected: hasInjectedRef.current,
  };
}
