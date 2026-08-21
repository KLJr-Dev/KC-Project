import { createHash, randomBytes } from 'crypto';

export function hashRefreshToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

export function newRefreshTokenRaw(): string {
  return randomBytes(48).toString('hex');
}

/** Default refresh TTL: 7 days */
export function refreshExpiresAtIso(ttlMs = 7 * 24 * 60 * 60 * 1000): string {
  return new Date(Date.now() + ttlMs).toISOString();
}
