/**
 * M5 / v2.0.0 — Password hashing & verification (security-baseline).
 *
 * Security measures:
 * - CWE-256 / CWE-916: Never store plaintext. bcrypt with cost factor ≥ 12
 *   (adaptive work factor; resists offline brute-force of stolen hashes).
 * - CWE-208: Dummy bcrypt compare on unknown users reduces timing oracle
 *   that distinguishes “no such email” vs “bad password” (pairs with generic
 *   “Invalid credentials” messaging from M3).
 * - Legacy plaintext rows (pre-migration) are rejected — migration must
 *   re-hash known demo accounts; new writes always go through hashPassword().
 *
 * Cost 12 is the baseline minimum; raise via BCRYPT_COST only if ops accept
 * the extra CPU on login/register (DoS trade-off — rate limits land in M8).
 */
import * as bcrypt from 'bcrypt';

/** Baseline minimum; do not lower in production. */
export const BCRYPT_COST = Math.max(12, Number(process.env.BCRYPT_COST || 12) || 12);

/**
 * Precomputed bcrypt hash of a fixed dummy string (cost 12).
 * Used only to spend comparable CPU when the user row is missing.
 * Not a secret — any constant valid hash works.
 */
const DUMMY_BCRYPT_HASH =
  '$2b$12$zkYDYfIqYZXhi6tCFFgSh.dh/UWrFfUB7Dt7SkvbCspe/yzna9XFm';

/**
 * True if `stored` looks like a bcrypt hash ($2a$ / $2b$ / $2y$).
 * Plaintext or empty values are never treated as valid stored secrets.
 */
export function isBcryptHash(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && /^\$2[aby]\$\d{2}\$/.test(stored);
}

/**
 * Hash a plaintext password for persistence.
 * Callers must pass the raw password from the request — never double-hash.
 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

/**
 * Verify a login attempt against the stored credential.
 * Returns false for missing/non-bcrypt storage (fail closed after M5 migration).
 */
export async function verifyPassword(
  plain: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!plain || !isBcryptHash(stored)) {
    return false;
  }
  return bcrypt.compare(plain, stored as string);
}

/**
 * Spend bcrypt CPU comparable to a real verify when no user row exists.
 * Call before throwing UnauthorizedException on login miss.
 */
export async function burnPasswordCompareBudget(plain: string): Promise<void> {
  try {
    await bcrypt.compare(plain || 'x', DUMMY_BCRYPT_HASH);
  } catch {
    // Ignore malformed dummy edge cases — budget already spent or not needed.
  }
}
