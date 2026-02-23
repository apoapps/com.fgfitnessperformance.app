/**
 * Simple event emitter for tab press → WebView root reset.
 *
 * When user taps the already-active tab, emits an event so the
 * corresponding EmbeddedWebScreen navigates the WebView back to
 * the tab's root path and scrolls to top.
 */

type TabResetCallback = (rootPath: string) => void;

const _listeners = new Map<string, Set<TabResetCallback>>();

/** Emit a tab reset event for a specific tab. */
export function emitTabReset(tabName: string, rootPath: string): void {
  const listeners = _listeners.get(tabName);
  if (!listeners) return;
  for (const cb of listeners) {
    cb(rootPath);
  }
}

/** Subscribe to tab reset events for a specific tab. Returns unsubscribe function. */
export function onTabReset(tabName: string, cb: TabResetCallback): () => void {
  if (!_listeners.has(tabName)) {
    _listeners.set(tabName, new Set());
  }
  _listeners.get(tabName)!.add(cb);
  return () => {
    _listeners.get(tabName)?.delete(cb);
  };
}
