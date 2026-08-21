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

/** Resolve RS256 keys (preferred) or HS256 secret fallback for local/e2e. */
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

  return {
    algorithm: 'HS256',
    secret: process.env.JWT_SECRET || 'dev-only-change-me',
    expiresIn,
  };
}
