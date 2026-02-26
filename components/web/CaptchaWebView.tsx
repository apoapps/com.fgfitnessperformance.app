import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const WEB_APP_URL = (
  process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://prod.fgfitnessperformance.com'
).replace(/\/$/, '');

/** Server-hosted captcha page URL — uses the web app's Turnstile site key */
const CAPTCHA_URL = `${WEB_APP_URL}/auth/mobile/captcha`;

interface CaptchaWebViewProps {
  onToken: (token: string) => void;
  onExpired: () => void;
  onError: () => void;
}

export interface CaptchaWebViewHandle {
  reset: () => void;
}

/**
 * Captcha WebView that loads the server-hosted Turnstile page.
 * The page at /auth/mobile/captcha uses the web app's Turnstile site key
 * and communicates tokens via the v2 bridge protocol (postMessage).
 */
export const CaptchaWebView = forwardRef<CaptchaWebViewHandle, CaptchaWebViewProps>(
  ({ onToken, onExpired, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [loaded, setLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      reset() {
        webViewRef.current?.injectJavaScript(`
          window.postMessage(JSON.stringify({ v: 2, type: 'CAPTCHA_RESET' }), '*');
          true;
        `);
      },
    }));

    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg?.v !== 2) return;

          switch (msg.type) {
            case 'CAPTCHA_TOKEN':
              onToken(msg.token);
              break;
            case 'CAPTCHA_EXPIRED':
              onExpired();
              break;
            case 'CAPTCHA_ERROR':
              console.log('[CaptchaWebView] Error:', msg.message);
              onError();
              break;
          }
        } catch {}
      },
      [onToken, onExpired, onError],
    );

    return (
      <View style={{ height: 75, overflow: 'hidden', borderRadius: 8 }}>
        <WebView
          ref={webViewRef}
          source={{ uri: CAPTCHA_URL }}
          onMessage={onMessage}
          onLoadEnd={() => setLoaded(true)}
          onError={() => onError()}
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          bounces={false}
          scrollEnabled={false}
          originWhitelist={['*']}
          allowsInlineMediaPlayback
          mixedContentMode="compatibility"
          style={{ opacity: loaded ? 1 : 0, backgroundColor: 'transparent' }}
          allowsBackForwardNavigationGestures={false}
          {...(Platform.OS === 'android' ? { allowFileAccess: true } : {})}
        />
      </View>
    );
  },
);
