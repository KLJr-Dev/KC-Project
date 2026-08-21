/**
 * M5 / v2.0.0 — JWT runtime key loading (RS256 preferred).
 *
 * Security measures:
 * - CWE-798 / CWE-321: No hardcoded production signing secret.
 * - CWE-347 / CWE-639: Production requires RS256 asymmetric keys so a stolen
 *   access token cannot be forged with a shared HS256 secret from source.
 * - Fail-closed boot: NODE_ENV=production without private+public keys throws
 *   before the app serves traffic (no silent HS256 fallback in prod).
 * - Non-production may fall back to HS256 + JWT_SECRET for local/e2e only;
 *   never rely on that path for compose “prod” profiles (keys mounted under
 *   infra/keys from M4).
 *
 * Key sources (first match wins per key):
 * 1. JWT_PRIVATE_KEY / JWT_PUBLIC_KEY env PEM (literal, `\n` escaped OK)
 * 2. JWT_PRIVATE_KEY_PATH / JWT_PUBLIC_KEY_PATH file paths
 * 3. Default ../infra/keys/jwt-private.pem + jwt-public.pem relative to cwd
 */
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

export type JwtRuntimeConfig = {
  algorithm: 'RS256' | 'HS256';
  privateKey?: string;
  publicKey?: string;
  secret?: string;
  expiresIn: string;
};

function readPem(envValue: string | undefined, pathEnv: string | undefined): string | undefined {
  if (envValue && envValue.trim()) {
    return envValue.replace(/\\n/g, '\n');
  }
  if (pathEnv && existsSync(pathEnv)) {
    return readFileSync(pathEnv, 'utf8');
  }
  return undefined;
}

function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Resolve signing/verification material for JwtModule.
 * @throws Error when production lacks both RS256 PEMs (fail closed).
 */
export function loadJwtRuntimeConfig(): JwtRuntimeConfig {
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  const defaultKeyDir = join(process.cwd(), '..', 'infra', 'keys');
  const privateKey = readPem(
    process.env.JWT_PRIVATE_KEY,
    process.env.JWT_PRIVATE_KEY_PATH || join(defaultKeyDir, 'jwt-private.pem'),
  );
  const publicKey = readPem(
    process.env.JWT_PUBLIC_KEY,
    process.env.JWT_PUBLIC_KEY_PATH || join(defaultKeyDir, 'jwt-public.pem'),
  );

  if (privateKey && publicKey) {
    return { algorithm: 'RS256', privateKey, publicKey, expiresIn };
  }

  if (isProductionRuntime()) {
    throw new Error(
      'JWT RS256 keys required in production. Set JWT_PRIVATE_KEY and JWT_PUBLIC_KEY ' +
        '(or JWT_PRIVATE_KEY_PATH / JWT_PUBLIC_KEY_PATH). HS256 fallback is disabled when NODE_ENV=production.',
    );
  }

  // Local / e2e only — weak default secret is intentional for offline tests.
  return {
    algorithm: 'HS256',
    secret: process.env.JWT_SECRET || 'dev-only-change-me',
    expiresIn,
  };
}
