/**
 * Cycle-3 leak-crack-db — planted values.
 * Spoilers: docs/security/Cycle-3/Dev/v1-leak-crack-db-ground-truth.md only.
 */

/** John target plaintext = Postgres role ctf_ro password (not app DB_PASSWORD). */
export const CTF_RO_USER = 'ctf_ro';
export const CTF_RO_PASSWORD = 'LeakDb2026!';

/** MD5 hex of CTF_RO_PASSWORD — body of ops-reminder.txt */
export const CTF_OPS_MD5_HEX = '19047e75065a16b851b512cd3b0c8fb5';

export const CTF_FLAG_LOCAL = '7a8b9c0d1e2f30415263748596a7b8c9';
export const CTF_FLAG_PROOF = '1f2e3d4c5b6a79887766554433221100';

export const CTF_OPS_FILE_ID = '9110';
export const CTF_OPS_SHARE_ID = '910';
export const CTF_OPS_SHARE_TOKEN =
  'b7e6d5c4a3928170605f4e3d2c1b0a9f8e7d6c5b4a3928170605f4e3d2c1b0a9';

/** Owner of the public ops share (demo user). */
export const CTF_OPS_OWNER_ID = '9001';

export function buildOpsReminderBody(): string {
  return [
    'legacy ops md5 (rotate me):',
    CTF_OPS_MD5_HEX,
    '',
    'If file search is flaky again, try GET /api/files?q=',
    '',
  ].join('\n');
}
