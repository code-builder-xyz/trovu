/** @module UrlOpener */

export type NavigateFn = (url: string) => void;

/**
 * Open an external URL, escaping the PWA shell on Android Chrome.
 */
export function openExternal(url: string, navigate?: NavigateFn): void {
  const go: NavigateFn =
    navigate ??
    ((u: string) => {
      if (typeof window !== "undefined") {
        window.location.href = u;
      }
    });

  const isPwa =
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  const isAndroid =
    typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

  if (isPwa && isAndroid) {
    const intentUrl = toAndroidIntentUrl(url);
    if (intentUrl) {
      go(intentUrl);
      return;
    }
  }

  go(url);
}

/**
 * Convert an http(s) URL to an Android intent URL that forces the OS default
 * browser.
 */
export function toAndroidIntentUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const scheme = parsed.protocol.slice(0, -1); // strip trailing ":"
  if (scheme !== "https" && scheme !== "http") {
    return null;
  }
  // Everything after "scheme://"
  const rest = url.substring(parsed.protocol.length + 2);
  return (
    `intent://${rest}` +
    `#Intent;scheme=${scheme};` +
    `action=android.intent.action.VIEW;` +
    `category=android.intent.category.BROWSABLE;` +
    `end`
  );
}
