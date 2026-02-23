import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.5.0 -- Real Multipart File Upload
 *
 * File entity mapped to the "file_entity" table in PostgreSQL.
 * Stores real file metadata from Multer multipart uploads:
 * filename (client-supplied), mimetype (client-supplied), storagePath
 * (absolute disk path), size (file size in bytes), description (optional),
 * approvalStatus (v0.4.3 carryover), uploadedAt (ISO timestamp), ownerId
 * (user who uploaded, never checked on access).
 *
 * v0.5.0 SCHEMA:
 * - id: PrimaryColumn (sequential string from count+1, CWE-330 enumerable)
 * - ownerId: Column (user ID who uploaded, stored but never re-checked, CWE-639)
 * - filename: Column (client originalname, no sanitisation, CWE-22)
 * - mimetype: Column (client Content-Type, no validation, CWE-434)
 * - storagePath: Column (absolute FS path, exposed in responses, CWE-200)
 * - size: Column (int, file size in bytes, no quota checks, CWE-400)
 * - description: Column (optional metadata, user-supplied text)
 * - approvalStatus: Column (enum: pending|approved|rejected, v0.4.3,
 *                            defaults to pending, no enforcement workflow)
 * - uploadedAt: Column (ISO timestamp string, UTC)
 *
 * VULN (v0.2.2 - CWE-639): ownerId is stored at creation time but never
 *       checked on read or delete operations. Any authenticated user who
 *       knows (or guesses) the file ID can access or delete another user's
 *       file. Combined with sequential IDs (CWE-330), full file enumeration
 *       and IDOR is trivial.
 *       Remediation (v2.0.0): WHERE owner_id = $1 on every query.
 *
 * VULN (v0.5.0 - CWE-434): mimetype is the raw Content-Type from the client
 *       request. No magic-byte validation -- a .html file can claim image/png.
 *       Download endpoint returns this MIME type in Content-Type header.
 *       CWE-434 (Unrestricted Upload of File with Dangerous Type) | A06:2025
 *       Remediation (v2.0.0): Validate via file magic bytes, not client header.
 *
 * VULN (v0.5.0 - CWE-22): filename is client-supplied originalname with no
 *       sanitisation. Filenames containing "../" or absolute paths can escape
 *       uploads/ directory. Multer writes to destination + filename, and
 *       filename is used as-is.
 *       CWE-22 (Path Traversal) | A01:2025
 *       Remediation (v2.0.0): UUID or hashed filenames; validate path is canonical.
 *
 * VULN (v0.5.0 - CWE-200): storagePath is the absolute filesystem path where
 *       the file was written. Exposed in API responses (FileResponseDto),
 *       revealing server directory structure to any authenticated user.
 *       CWE-200 (Exposure of Sensitive Information) | A01:2025
 *       Remediation (v2.0.0): Never expose storagePath in API responses.
 *       Store filename only; reconstruct safe path on access.
 *
 * VULN (v0.5.0 - CWE-400): No file size limits in schema. Multer writes
 *       unbounded file I/O; no per-file, per-user, or total storage quota.
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *       Remediation (v2.0.0): Enforce size limits at Multer config and
 *       application logic.
 */
@Entity()
export class FileEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  ownerId!: string;

  @Column()
  filename!: string;

  @Column({ nullable: true })
  mimetype?: string;

  @Column({ nullable: true })
  storagePath?: string;

  @Column({ type: 'int', default: 0 })
  size!: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'enum', enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  approvalStatus!: 'pending' | 'approved' | 'rejected';

  @Column()
  uploadedAt!: string;
}
