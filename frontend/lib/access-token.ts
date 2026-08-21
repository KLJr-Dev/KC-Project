/**
 * M6 / v2.0.0 — In-memory access JWT holder (SPA).
 *
 * Security measures:
 * - CWE-922: Access token is NOT written to localStorage/sessionStorage.
 *   XSS can still read JS memory while the tab is open, but cannot persist
 *   steal-after-close via Application storage. Refresh lives in httpOnly cookie.
 * - Module singleton survives client navigations within the same JS realm;
 *   hard refresh clears memory → AuthProvider silent-refreshes via cookie.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
