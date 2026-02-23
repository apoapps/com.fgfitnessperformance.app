/**
 * Bridge Protocol v2
 *
 * Typed message protocol for communication between:
 * - Native (React Native) ↔ WebView (Next.js)
 *
 * All messages have a version field `v: 2` for forward compatibility.
 */

// Messages from Web → Native (via window.ReactNativeWebView.postMessage)
export type WebToNativeMessage =
  | { v: 2; type: 'WEBVIEW_READY'; path: string }
  | { v: 2; type: 'WEBVIEW_ROUTE'; path: string }
  | { v: 2; type: 'AUTH_NEEDED' }
  | { v: 2; type: 'AUTH_EXPIRED' }
  | { v: 2; type: 'AUTH_ERROR'; message: string }
  | { v: 2; type: 'NAVIGATE'; path: string }
  | { v: 2; type: 'OPEN_SHEET'; sheet: string; data?: unknown }
  | { v: 2; type: 'HAPTIC'; style: 'light' | 'medium' | 'heavy' | 'success' | 'error' }
  | { v: 2; type: 'OPEN_EXTERNAL'; url: string }
  | { v: 2; type: 'CAPTCHA_TOKEN'; token: string }
  | { v: 2; type: 'CAPTCHA_EXPIRED' }
  | { v: 2; type: 'CAPTCHA_ERROR'; message: string };

// Messages from Native → Web (via webViewRef.injectJavaScript)
export type NativeToWebMessage =
  | { v: 2; type: 'AUTH_SESSION'; access_token: string; refresh_token: string }
  | { v: 2; type: 'AUTH_LOGOUT' }
  | { v: 2; type: 'THEME_CHANGE'; theme: 'light' | 'dark' }
  | { v: 2; type: 'NAVIGATE_TO'; path: string };

// Union type for parsing incoming messages
export type BridgeMessage = WebToNativeMessage | NativeToWebMessage;

/**
 * Parse a raw message string from WebView into a typed BridgeMessage.
 * Returns null if the message is not a valid v2 bridge message.
 */
export function parseBridgeMessage(raw: string): WebToNativeMessage | null {
  try {
    const msg = JSON.parse(raw);
    if (msg && msg.v === 2 && typeof msg.type === 'string') {
      return msg as WebToNativeMessage;
    }
    // Support legacy v1 messages (no version field) for backward compat
    if (msg && typeof msg.type === 'string' && !('v' in msg)) {
      return { ...msg, v: 2 } as WebToNativeMessage;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Build a JavaScript string to inject into WebView via injectJavaScript().
 * Sends a NativeToWebMessage to the web app.
 */
export function buildInjectedMessage(msg: NativeToWebMessage): string {
  const json = JSON.stringify(msg);
  return `
    window.postMessage(${json}, '*');
    true;
  `;
}
