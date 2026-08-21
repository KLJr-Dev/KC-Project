import { randomUUID } from 'crypto';
import { basename, extname } from 'path';
import { readFileSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_EXT = new Set(['.txt', '.png', '.jpg', '.jpeg', '.pdf']);

/** Sanitize client filename: strip paths, limit charset/length. */
export function sanitizeUploadFilename(originalName: string): string {
  const base = basename(originalName || 'upload').replace(/^\.+/, '');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'upload';
  const ext = extname(cleaned).toLowerCase();
  if (ext && !ALLOWED_EXT.has(ext)) {
    throw new BadRequestException('File type not allowed');
  }
  return `${randomUUID()}-${cleaned}`;
}

export function detectMimeFromBuffer(buf: Buffer): string | null {
  if (buf.length >= 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return 'image/png';
  }
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return 'image/jpeg';
  }
  if (buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return 'application/pdf';
  }
  const sample = buf.subarray(0, Math.min(buf.length, 512));
  if (sample.length > 0 && !sample.includes(0)) {
    return 'text/plain';
  }
  return null;
}

export function assertSafeUpload(storagePath: string, clientMime?: string): {
  mimetype: string;
  size: number;
} {
  const buf = readFileSync(storagePath);
  if (buf.length > MAX_UPLOAD_BYTES) {
    throw new BadRequestException('File too large');
  }
  const detected = detectMimeFromBuffer(buf);
  if (!detected) {
    throw new BadRequestException('Unrecognized or disallowed file content');
  }
  if (clientMime && /html|javascript|svg/i.test(clientMime) && detected !== clientMime) {
    throw new BadRequestException('Content-Type does not match file contents');
  }
  if (detected === 'text/plain' && clientMime && /image\//i.test(clientMime)) {
    throw new BadRequestException('Content-Type does not match file contents');
  }
  return { mimetype: detected, size: buf.length };
}

export const UPLOAD_FILE_SIZE_LIMIT = MAX_UPLOAD_BYTES;
