/**
 * Note attachment upload helpers — Cycle-4 Blue (`v2.2.0`).
 *
 * C4-F01b: no SVG/HTML (scriptable types); always download disposition at the
 * controller. Aligned with Files upload-security spirit — path-safe names, size
 * cap, store under uploads/notes/.
 */
import { randomUUID } from 'crypto';
import { basename, extname, join } from 'path';
import { mkdirSync, readFileSync } from 'fs';
import { BadRequestException } from '@nestjs/common';
import { uploadsRoot } from '../files/storage-path.util';

const MAX_NOTE_ATTACHMENT_BYTES = 2 * 1024 * 1024;

/** Secure tip allowlist — no svg/html (C4-F01b). */
const ALLOWED_EXT = new Set(['.txt', '.png', '.jpg', '.jpeg', '.pdf']);

export function notesUploadsDir(): string {
  const dir = join(uploadsRoot(), 'notes');
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** Sanitize client filename; UUID prefix; reject non-allowlisted extensions. */
export function sanitizeNoteAttachmentFilename(originalName: string): string {
  const base = basename(originalName || 'upload').replace(/^\.+/, '');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'upload';
  const ext = extname(cleaned).toLowerCase();
  if (ext && !ALLOWED_EXT.has(ext)) {
    throw new BadRequestException('Attachment type not allowed');
  }
  return `${randomUUID()}-${cleaned}`;
}

function looksLikeSvg(buf: Buffer): boolean {
  const head = buf.subarray(0, Math.min(buf.length, 2048)).toString('utf8').toLowerCase();
  return head.includes('<svg');
}

function looksLikeHtml(buf: Buffer): boolean {
  const head = buf.subarray(0, Math.min(buf.length, 2048)).toString('utf8').toLowerCase();
  return (
    head.includes('<html') ||
    head.includes('<!doctype html') ||
    head.includes('<script') ||
    head.includes('<img')
  );
}

/**
 * Content check for note attachments.
 * Magic-bytes for png/jpeg/pdf; reject SVG/HTML payloads even if mislabeled.
 */
export function assertNoteAttachment(
  storagePath: string,
  clientMime?: string,
): { mimetype: string; size: number } {
  const buf = readFileSync(storagePath);
  if (buf.length > MAX_NOTE_ATTACHMENT_BYTES) {
    throw new BadRequestException('Attachment too large');
  }
  if (buf.length === 0) {
    throw new BadRequestException('Empty attachment');
  }

  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) {
    return { mimetype: 'image/png', size: buf.length };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { mimetype: 'image/jpeg', size: buf.length };
  }
  if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
    return { mimetype: 'application/pdf', size: buf.length };
  }

  // C4-F01b: refuse scriptable markup even under .txt / wrong MIME
  if (looksLikeSvg(buf) || looksLikeHtml(buf)) {
    throw new BadRequestException('Attachment type not allowed');
  }

  // Remaining text (e.g. .txt) — no NUL in the first chunk
  if (!buf.subarray(0, Math.min(buf.length, 512)).includes(0)) {
    return { mimetype: clientMime || 'text/plain', size: buf.length };
  }

  throw new BadRequestException('Unrecognized attachment content');
}

export const NOTE_ATTACHMENT_SIZE_LIMIT = MAX_NOTE_ATTACHMENT_BYTES;
