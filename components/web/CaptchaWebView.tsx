import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { parseBridgeMessage, buildInjectedMessage } from '@/utils/bridge';

const WEB_APP_URL = (process.env.EXPO_PUBLIC_WEB_APP_URL || 'https://prod.fgfitnessperformance.com').replace(/\/$/, '');

interface CaptchaWebViewProps {
  onToken: (token: string) => void;
  onExpired: () => void;
  onError: () => void;
}

export interface CaptchaWebViewHandle {
  reset: () => void;
}

/**
 * Hidden WebView (70px tall) that loads /auth/mobile/captcha and
 * exposes the Turnstile captcha token via callbacks.
 */
export const CaptchaWebView = forwardRef<CaptchaWebViewHandle, CaptchaWebViewProps>(
  ({ onToken, onExpired, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [loaded, setLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      reset() {
        webViewRef.current?.injectJavaScript(
          buildInjectedMessage({ v: 2, type: 'NAVIGATE_TO', path: '' })
            .replace('NAVIGATE_TO', 'CAPTCHA_RESET' as any)
        );
        // Simpler: just send a direct postMessage
        webViewRef.current?.injectJavaScript(`
          window.postMessage(${JSON.stringify({ v: 2, type: 'CAPTCHA_RESET' })}, '*');
          true;
        `);
      },
    }));

    const onMessage = useCallback(
      (event: WebViewMessageEvent) => {
        const msg = parseBridgeMessage(event.nativeEvent.data);
        if (!msg) return;

        switch (msg.type) {
          case 'CAPTCHA_TOKEN':
            onToken((msg as any).token);
            break;
          case 'CAPTCHA_EXPIRED':
            onExpired();
            break;
          case 'CAPTCHA_ERROR':
            onError();
            break;
        }
      },
      [onToken, onExpired, onError],
    );

    const source = { uri: `${WEB_APP_URL}/auth/mobile/captcha` };

    return (
      <View style={{ height: 70, overflow: 'hidden', borderRadius: 8 }}>
        <WebView
          ref={webViewRef}
          source={source}
          onMessage={onMessage}
          onLoadEnd={() => setLoaded(true)}
          onError={() => onError()}
          javaScriptEnabled
          domStorageEnabled
          bounces={false}
          scrollEnabled={false}
          style={{ opacity: loaded ? 1 : 0, backgroundColor: 'transparent' }}
        />
      </View>
    );
  },
);
