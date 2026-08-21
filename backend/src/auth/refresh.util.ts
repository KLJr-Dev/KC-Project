/**
 * M4/M6 — Refresh token helpers (opaque raw + SHA-256 at rest).
 *
 * Security measures:
 * - CWE-916: Store only SHA-256(hash) of refresh tokens in DB.
 * - CWE-613: Default idle TTL 7 days (httpOnly cookie Max-Age aligned in cookie.util).
 * - Rotation happens in AuthService.refresh (revoke old, issue new).
 */
import { createHash, randomBytes } from 'crypto';

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function newRefreshTokenRaw(): string {
  return randomBytes(48).toString('hex');
}

/** Default refresh TTL: 7 days (document + enforce via cookie Max-Age and DB expiresAt). */
export function refreshExpiresAtIso(ttlMs = 7 * 24 * 60 * 60 * 1000): string {
  return new Date(Date.now() + ttlMs).toISOString();
}
