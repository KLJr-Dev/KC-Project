/**
 * Ops Documents — Cycle-7 Blue (`v2.4.0`).
 *
 * Authenticated handbook read under `ops-docs/library`. Paths are resolved and
 * must remain under the library root (closes CWE-22 / C7-F01 / FC-18).
 *
 * @see docs/security/Cycle-7/Remediation/v2.4.0-remediation.md
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { readFile, realpath } from 'fs/promises';
import { join, resolve, sep } from 'path';

const MAX_BYTES = 64_000;

@Injectable()
export class OpsService {
  /** Public handbook-style docs (viewer root). */
  private libraryRoot(): string {
    return join(process.cwd(), 'ops-docs', 'library');
  }

  private underRoot(root: string, candidate: string): boolean {
    return candidate === root || candidate.startsWith(root + sep);
  }

  /**
   * Read a document relative to the library root.
   * Rejects absolute paths and any resolve/realpath escape outside the root.
   */
  async readDocument(relPath: string): Promise<{ path: string; content: string }> {
    if (!relPath || relPath.includes('\0')) {
      throw new BadRequestException('Invalid path');
    }
    if (relPath.startsWith('/') || /^[A-Za-z]:[\\/]/.test(relPath)) {
      throw new BadRequestException('Invalid path');
    }

    const root = await realpath(this.libraryRoot());
    const candidate = resolve(root, relPath);

    if (!this.underRoot(root, candidate)) {
      throw new BadRequestException('Path escapes library root');
    }

    let target: string;
    try {
      target = await realpath(candidate);
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        throw new NotFoundException('Document not found');
      }
      throw err;
    }

    if (!this.underRoot(root, target)) {
      throw new BadRequestException('Path escapes library root');
    }

    try {
      const buf = await readFile(target);
      const truncated = buf.subarray(0, MAX_BYTES);
      return {
        path: relPath,
        content: truncated.toString('utf8'),
      };
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === 'ENOENT' || code === 'ENOTDIR') {
        throw new NotFoundException('Document not found');
      }
      if (code === 'EISDIR') {
        throw new BadRequestException('Path is a directory');
      }
      throw err;
    }
  }
}
