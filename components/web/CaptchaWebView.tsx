import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

const SITE_KEY = process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '';

/**
 * Inline HTML that loads the Turnstile widget directly.
 * No server dependency — loads challenges.cloudflare.com script directly.
 * Communicates token/expiry/error back to native via ReactNativeWebView.postMessage.
 */
const TURNSTILE_HTML = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    display: flex; justify-content: center; align-items: center;
    min-height: 70px; background: transparent;
    font-family: -apple-system, sans-serif;
  }
  #msg { color: #a1a1aa; font-size: 12px; display: none; }
</style>
</head><body>
<div id="captcha"></div>
<div id="msg"></div>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" async defer></script>
<script>
  var widgetId = null;
  var attempts = 0;
  var maxAttempts = 30; // 30 * 200ms = 6s max wait

  function post(payload) {
    try { window.ReactNativeWebView.postMessage(JSON.stringify(payload)); } catch(e) {}
  }

  function renderWidget() {
    if (window.turnstile) {
      try {
        widgetId = window.turnstile.render('#captcha', {
          sitekey: '${SITE_KEY}',
          theme: 'dark',
          size: 'compact',
          callback: function(token) { post({ v: 2, type: 'CAPTCHA_TOKEN', token: token }); },
          'expired-callback': function() { post({ v: 2, type: 'CAPTCHA_EXPIRED' }); },
          'error-callback': function(code) { post({ v: 2, type: 'CAPTCHA_ERROR', message: 'error:' + code }); },
          'timeout-callback': function() { post({ v: 2, type: 'CAPTCHA_ERROR', message: 'timeout' }); }
        });
      } catch(e) {
        post({ v: 2, type: 'CAPTCHA_ERROR', message: e.message });
      }
    } else {
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(renderWidget, 200);
      } else {
        post({ v: 2, type: 'CAPTCHA_ERROR', message: 'script_timeout' });
        document.getElementById('msg').style.display = 'block';
        document.getElementById('msg').textContent = 'Error cargando verificacion';
      }
    }
  }

  // Reset handler from native
  window.addEventListener('message', function(e) {
    try {
      var msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (msg && msg.type === 'CAPTCHA_RESET' && window.turnstile && widgetId) {
        window.turnstile.reset(widgetId);
      }
    } catch(err) {}
  });

  // Start rendering after DOM + script ready
  if (document.readyState === 'complete') {
    renderWidget();
  } else {
    window.addEventListener('load', renderWidget);
  }
</script>
</body></html>`;

interface CaptchaWebViewProps {
  onToken: (token: string) => void;
  onExpired: () => void;
  onError: () => void;
}

export interface CaptchaWebViewHandle {
  reset: () => void;
}

/**
 * Inline Turnstile WebView (70px tall).
 * Uses inline HTML (no server) with proper WKWebView config per Cloudflare docs:
 * - sharedCookiesEnabled for persistent cookies
 * - domStorageEnabled for localStorage
 * - Stable User-Agent (default)
 * - Network access to challenges.cloudflare.com
 */
export const CaptchaWebView = forwardRef<CaptchaWebViewHandle, CaptchaWebViewProps>(
  ({ onToken, onExpired, onError }, ref) => {
    const webViewRef = useRef<WebView>(null);
    const [loaded, setLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      reset() {
        webViewRef.current?.injectJavaScript(`
          window.postMessage(JSON.stringify({ type: 'CAPTCHA_RESET' }), '*');
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
          source={{ html: TURNSTILE_HTML, baseUrl: 'https://challenges.cloudflare.com' }}
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
          // iOS: allow network access
          allowsBackForwardNavigationGestures={false}
          // Android: file access for Turnstile
          {...(Platform.OS === 'android' ? { allowFileAccess: true } : {})}
        />
      </View>
    );
  },
);
