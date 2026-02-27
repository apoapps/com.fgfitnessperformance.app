/**
 * Global signal for first WebView content ready.
 *
 * Used to coordinate splash screen dismissal: splash stays visible
 * until BOTH auth is resolved AND the first WebView has loaded content.
 * This eliminates the intermediate ActivityIndicator between splash and content.
 */

type ReadyCallback = () => void;

let _isReady = false;
let _callback: ReadyCallback | null = null;
let _errorCallback: ReadyCallback | null = null;

/** Signal that the first WebView content is ready to display. */
export function setAppContentReady(): void {
  if (_isReady) return;
  _isReady = true;
  _callback?.();
}

/** Signal that WebView loading failed (all retries exhausted). */
export function setAppContentError(): void {
  _errorCallback?.();
}

/** Register a one-time callback for when app content is ready. */
export function onAppContentReady(cb: ReadyCallback): () => void {
  if (_isReady) {
    cb();
    return () => {};
  }
  _callback = cb;
  return () => {
    if (_callback === cb) _callback = null;
  };
}

/** Register a callback for when WebView loading fails. */
export function onAppContentError(cb: ReadyCallback): () => void {
  _errorCallback = cb;
  return () => {
    if (_errorCallback === cb) _errorCallback = null;
  };
}

/** Reset ready state (e.g. on logout, before next login). */
export function resetAppReady(): void {
  _isReady = false;
  _callback = null;
  _errorCallback = null;
}
