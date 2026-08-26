/**
 * M6 / v2.0.0 — Refresh-token httpOnly cookie helpers.
 *
 * Security measures:
 * - CWE-922 / CWE-1004: Refresh secret never exposed to JavaScript (HttpOnly).
 * - CWE-1275: SameSite=Lax on HTTP lab profile; SameSite=Strict when
 *   COOKIE_SECURE=true (TLS profile / M7). Blocks most cross-site cookie sends.
 * - CWE-614: Secure flag when COOKIE_SECURE=true so cookies are HTTPS-only.
 * - Path scoped to auth routes (`/api/auth` behind nginx; `/auth` for direct
 *   Nest/e2e via REFRESH_COOKIE_PATH).
 *
 * Cookie name is not secret; the raw refresh value is. Clearing uses Max-Age=0.
 */
import type { Response } from 'express';

/** Browser-visible cookie name (Application → Cookies). */
export const REFRESH_COOKIE_NAME = process.env.REFRESH_COOKIE_NAME || 'kc_refresh';

/** 7 days — aligned with refresh.util default TTL. */
export const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type RefreshCookieOptions = {
  httpOnly: true;
  path: string;
  maxAge: number;
  sameSite: 'strict' | 'lax' | 'none';
  secure: boolean;
};

/** Public cookie path (env so e2e can use `/auth` without nginx `/api` prefix). */
export function refreshCookiePath(): string {
  return process.env.REFRESH_COOKIE_PATH || '/api/auth';
}

/**
 * Build Set-Cookie options from env.
 * - COOKIE_SECURE=true → Secure + SameSite=Strict (TLS compose)
 * - otherwise → SameSite=Lax without Secure (HTTP :8080 lab)
 */
export function refreshCookieOptions(maxAgeMs = REFRESH_COOKIE_MAX_AGE_MS): RefreshCookieOptions {
  const secure = process.env.COOKIE_SECURE === 'true';
  // Cycle-6 insecure tip: COOKIE_SAMESITE=none|lax|strict (default lax on HTTP, strict on TLS).
  // Cross-site CSRF via GET /auth/bookmarks/save still works with Lax (top-level nav).
  const fromEnv = (process.env.COOKIE_SAMESITE || '').toLowerCase();
  const sameSite: 'strict' | 'lax' | 'none' =
    fromEnv === 'none' || fromEnv === 'lax' || fromEnv === 'strict'
      ? fromEnv
      : secure
        ? 'strict'
        : 'lax';
  return {
    httpOnly: true,
    path: refreshCookiePath(),
    maxAge: maxAgeMs,
    sameSite,
    secure: sameSite === 'none' ? true : secure,
  };
}

/** Persist rotated refresh token for the browser session. */
export function setRefreshCookie(res: Response, rawRefreshToken: string): void {
  res.cookie(REFRESH_COOKIE_NAME, rawRefreshToken, refreshCookieOptions());
}

/** Expire the refresh cookie (logout / failed refresh). */
export function clearRefreshCookie(res: Response): void {
  res.cookie(REFRESH_COOKIE_NAME, '', {
    ...refreshCookieOptions(0),
    maxAge: 0,
  });
}
