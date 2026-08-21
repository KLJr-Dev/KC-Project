/**
 * M8 / v2.0.0 — Upload directory path containment (CWE-22).
 *
 * Security measures:
 * - Resolve the candidate path and require it to stay under UPLOADS_DIR
 *   (default: `<cwd>/uploads`). Blocks `../` escapes even if a DB row's
 *   `storagePath` was tampered with.
 * - Call before every `res.sendFile(...)` (authenticated download + public share).
 */
import { ForbiddenException } from '@nestjs/common';
import { resolve, sep } from 'path';

/** Absolute uploads root (overridable via UPLOADS_DIR). */
export function uploadsRoot(): string {
  return resolve(process.env.UPLOADS_DIR || resolve(process.cwd(), 'uploads'));
}

/**
 * @returns Canonical absolute path under uploads/
 * @throws ForbiddenException when the path escapes the uploads root
 */
export function assertPathInsideUploads(storagePath: string): string {
  const root = uploadsRoot();
  const resolved = resolve(storagePath);
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`;
  if (resolved !== root && !resolved.startsWith(prefix)) {
    throw new ForbiddenException('Invalid file path');
  }
  return resolved;
}
