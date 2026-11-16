/**
 * Document packets service (Cycle-10 Blue / v2.10.0).
 *
 * callHelper: basename + allowlist + encodeURIComponent before contacting
 * docproc — never pass untrusted strings into a shell (A03).
 * Hard gate: controller @HasRole(['moderator','admin']); DB role authoritative.
 */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { basename } from 'path';
import { randomUUID } from 'crypto';
import { DocumentPacket } from './entities/document-packet.entity';
import { AuditService } from '../admin/audit.service';
import { AlertsService } from '../admin/alerts.service';
import { detectMimeFromBuffer } from '../files/upload-security';

const DOCPROC_URL = process.env.DOCPROC_URL || 'http://docproc:9090';
const HELPER_TIMEOUT_MS = 8_000;
/** Safe packet filenames only — no shell metacharacters / path segments. */
const SAFE_NAME = /^[A-Za-z0-9._-]{1,128}$/;

@Injectable()
export class PacketsService {
  constructor(
    @InjectRepository(DocumentPacket)
    private readonly packetRepo: Repository<DocumentPacket>,
    private readonly audit: AuditService,
    private readonly alerts: AlertsService,
  ) {}

  async listForOwner(ownerUserId: string): Promise<DocumentPacket[]> {
    return this.packetRepo.find({
      where: { ownerUserId },
      order: { createdAt: 'DESC' },
    });
  }

  async getById(id: string, ownerUserId: string): Promise<DocumentPacket> {
    const row = await this.packetRepo.findOne({ where: { id } });
    if (!row || row.ownerUserId !== ownerUserId) {
      throw new NotFoundException();
    }
    return row;
  }

  async upload(
    file: Express.Multer.File,
    ownerUserId: string,
  ): Promise<DocumentPacket> {
    if (!file) {
      throw new BadRequestException('file required');
    }

    const id = randomUUID();
    const storageKey = file.path || file.filename;

    let originalName: string;
    try {
      originalName = this.sanitizeOriginalName(file.originalname || 'upload.bin');
    } catch (err) {
      if (err instanceof BadRequestException) {
        await this.audit.record(ownerUserId, 'packet_helper_reject', id, {
          reason: 'invalid_name',
        });
        await this.alerts.raise(
          'medium',
          'packet_reject',
          'Packet upload rejected: invalid filename',
          'packet_helper_reject',
        );
      }
      throw err;
    }

    if (file.buffer?.length) {
      const mime = detectMimeFromBuffer(file.buffer);
      if (!mime) {
        await this.audit.record(ownerUserId, 'packet_helper_reject', id, {
          reason: 'invalid_content',
        });
        await this.alerts.raise(
          'medium',
          'packet_reject',
          'Packet upload rejected: unrecognized content',
          'packet_helper_reject',
        );
        throw new BadRequestException('unrecognized or disallowed file content');
      }
    }

    let helperOutput = '';
    let status = 'processed';
    try {
      helperOutput = await this.callHelper(originalName, file.buffer);
      await this.audit.record(ownerUserId, 'packet_upload', id, {
        originalName,
      });
    } catch (err) {
      const msg = (err as Error).message || 'helper failed';
      if (err instanceof BadRequestException) {
        await this.audit.record(ownerUserId, 'packet_helper_reject', id, {
          reason: 'invalid_name',
        });
        await this.alerts.raise(
          'medium',
          'packet_reject',
          'Packet upload rejected: invalid filename',
          'packet_helper_reject',
        );
        throw err;
      }
      status = 'helper_error';
      helperOutput = 'helper-error: unavailable';
      await this.audit.record(ownerUserId, 'packet_helper_error', id, {
        reason: msg.slice(0, 120),
      });
    }

    const row = this.packetRepo.create({
      id,
      ownerUserId,
      originalName,
      storageKey,
      status,
      helperOutput: this.redactHelperOutput(helperOutput),
      createdAt: new Date().toISOString(),
    });
    await this.packetRepo.insert(row);
    return row;
  }

  /** Basename + allowlist — rejects path traversal and shell metacharacters. */
  sanitizeOriginalName(raw: string): string {
    const base = basename(raw.replace(/\\/g, '/')).trim();
    if (!SAFE_NAME.test(base)) {
      throw new BadRequestException('invalid filename');
    }
    return base;
  }

  private redactHelperOutput(text: string): string {
    return text
      .replace(/OS\{[0-9a-fA-F]{32}\}/g, '[redacted]')
      .slice(0, 2000);
  }

  private async callHelper(originalName: string, body?: Buffer): Promise<string> {
    const url = `${DOCPROC_URL}/?name=${encodeURIComponent(originalName)}`;
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
      if (res.status === 400) {
        throw new BadRequestException('invalid filename');
      }
      if (!res.ok) {
        throw new ServiceUnavailableException(`docproc ${res.status}`);
      }
      return text;
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      if ((err as Error).name === 'AbortError') {
        throw new ServiceUnavailableException('docproc helper timeout');
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }
}
