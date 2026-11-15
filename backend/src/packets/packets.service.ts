/**
 * Cycle-10 — PacketsService (SoftDev B6).
 *
 * Graded plant (CYCLE10-PLANT):
 * After storing packet metadata, calls docproc helper with the client's
 * **unsanitized** original filename in the query string. Helper runs
 * `file {name}` via shell → command injection / reverse shell.
 *
 * Hard gate: controller enforces @HasRole(['moderator','admin']); plain user 403.
 * Env: DOCPROC_URL (default http://docproc:9090) — lab overlay attaches backend to net_app.
 *
 * @see infra/cycle10/docproc/helper.py
 * @see docs/security/Cycle-10/Dev/v1.10.0-box-plan.md
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { DocumentPacket } from './entities/document-packet.entity';

/** Lab DNS name from cycle10-lab overlay; override for native SoftDev. */
const DOCPROC_URL = process.env.DOCPROC_URL || 'http://docproc:9090';
const HELPER_TIMEOUT_MS = 8_000;

@Injectable()
export class PacketsService {
  constructor(
    @InjectRepository(DocumentPacket)
    private readonly packetRepo: Repository<DocumentPacket>,
  ) {}

  /** List packets owned by the authenticated moderator. */
  async listForOwner(ownerUserId: string): Promise<DocumentPacket[]> {
    return this.packetRepo.find({
      where: { ownerUserId },
      order: { createdAt: 'DESC' },
    });
  }

  /** Owner-scoped get; 404 if missing or not owned (no IDOR across mods for SoftDev). */
  async getById(id: string, ownerUserId: string): Promise<DocumentPacket> {
    const row = await this.packetRepo.findOne({ where: { id } });
    if (!row || row.ownerUserId !== ownerUserId) {
      throw new NotFoundException();
    }
    return row;
  }

  /**
   * Accept multipart upload, persist row, invoke docproc helper.
   * CYCLE10-PLANT: `originalname` is passed through without sanitization/encoding.
   */
  async upload(
    file: Express.Multer.File,
    ownerUserId: string,
  ): Promise<DocumentPacket> {
    if (!file) {
      throw new BadRequestException('file required');
    }

    const id = randomUUID();
    const storageKey = file.path || file.filename;
    const originalName = file.originalname || 'upload.bin';

    let helperOutput = '';
    try {
      helperOutput = await this.callHelper(originalName, file.buffer);
    } catch (err) {
      // SoftDev: still persist the packet so UI/examiner can see helper errors
      helperOutput = `helper-error: ${(err as Error).message}`;
    }

    const row = this.packetRepo.create({
      id,
      ownerUserId,
      originalName,
      storageKey,
      status: 'processed',
      helperOutput: helperOutput.slice(0, 4000),
      createdAt: new Date().toISOString(),
    });
    await this.packetRepo.insert(row);
    return row;
  }

  /**
   * CYCLE10-PLANT — intentional: do **not** URI-encode `originalName`.
   * Shell metacharacters (`;`, `|`, backticks, …) must reach helper.py.
   */
  private async callHelper(originalName: string, body?: Buffer): Promise<string> {
    const url = `${DOCPROC_URL}/?name=${originalName}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HELPER_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: controller.signal,
        headers: { 'Content-Type': 'application/octet-stream' },
        body: body && body.length ? new Uint8Array(body) : undefined,
      });
      const text = await res.text();
      if (!res.ok) {
        throw new ServiceUnavailableException(`docproc ${res.status}: ${text}`);
      }
      return text;
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('docproc helper timeout');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
