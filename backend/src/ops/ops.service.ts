/**
 * Ops Documents — Cycle-7 intentional insecure tip (`v1.4.0`).
 *
 * CWE-22 / FC-18: `path` is joined under the library root **without**
 * canonicalization or a “must stay inside root” check, so `../` reaches the
 * plant tree. Blue `v2.4.0` must resolve + reject escapes.
 *
 * @see docs/security/Cycle-7/Dev/cycle-7-decisions.md
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { CYCLE7_FLAG_F1_LFI } from './cycle7-plants';

const MAX_BYTES = 64_000;

@Injectable()
export class OpsService {
  /** Public handbook-style docs (intended starting directory for viewers). */
  private libraryRoot(): string {
    return join(process.cwd(), 'ops-docs', 'library');
  }

  /**
   * Read a document relative to the library root.
   *
   * INTENTIONAL LFI: we use path.join only — we do **not** call realpath or
   * assert the result stays under libraryRoot(), so `../plants/...` works.
   */
  async readDocument(relPath: string): Promise<{ path: string; content: string }> {
    if (!relPath || relPath.includes('\0')) {
      throw new BadRequestException('Invalid path');
    }

    const target = join(this.libraryRoot(), relPath);

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

  /** Dev/examiner helper — F1 string (not an HTTP route). */
  f1Marker(): string {
    return CYCLE7_FLAG_F1_LFI;
  }
}
