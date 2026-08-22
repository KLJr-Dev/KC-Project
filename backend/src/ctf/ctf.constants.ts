/**
 * v1.1.0 CTF — planted proof values (Cycle-2).
 * Spoilers: documented in docs/security/Cycle-2/Dev/v1.1.0-ground-truth.md only.
 */

/** Must match infra/docker-compose.ctf.yml DB_PASSWORD default and proof.txt loot line. */
export const CTF_DB_PASSWORD = 'KcCtfDbPr0of2026!';

export const CTF_FLAG_USER = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
export const CTF_FLAG_ADMIN = '0f1e2d3c4b5a69788796a5b4c3d2e1f0';
export const CTF_FLAG_DB = '9c8b7a69584736251e0f1d2c3b4a5968';

export const CTF_LISA = {
  id: '9005',
  email: 'lisa@kc.test',
  username: 'lisa',
  password: 'lisa123',
  role: 'user' as const,
};

export const CTF_FILE_LOCAL_ID = '9104';
export const CTF_FILE_PROOF_ID = '9105';

export function buildProofTxtBody(): string {
  return `${CTF_FLAG_ADMIN}\nDB_PASSWORD=${CTF_DB_PASSWORD}\n`;
}

export function buildLocalTxtBody(): string {
  return `${CTF_FLAG_USER}\n`;
}
