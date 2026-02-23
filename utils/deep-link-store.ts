/**
 * In-memory store for pending deep link paths.
 *
 * When +not-found catches an unmatched route (deep link), it stores the
 * original web path here before redirecting to the correct native tab.
 * The EmbeddedWebScreen then consumes this path to navigate the WebView.
 */

let pendingPath: string | null = null;

export function setPendingDeepLink(path: string): void {
  pendingPath = path;
}

export function consumePendingDeepLink(): string | null {
  const path = pendingPath;
  pendingPath = null;
  return path;
}
