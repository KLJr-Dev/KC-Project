import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.3.0 -- File Upload
 *
 * File entity mapped to the "file_entity" table in PostgreSQL.
 * Now stores real file metadata from Multer multipart uploads:
 * mimetype (client-supplied), storagePath (absolute disk path),
 * and actual file size.
 *
 * VULN (v0.2.2): ownerId is stored at creation time but never checked on
 *       read or delete operations. Any authenticated user who knows (or
 *       guesses) the file ID can access or delete another user's file.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 *       Remediation (v2.0.0): WHERE owner_id = $1 on every query.
 *
 * VULN (v0.3.0): mimetype is the raw Content-Type from the client request.
 *       No magic-byte validation -- a .html file can claim image/png.
 *       CWE-434 (Unrestricted Upload of File with Dangerous Type) | A06:2025
 *       Remediation (v2.0.0): Validate via file magic bytes, not client header.
 *
 * VULN (v0.3.0): storagePath is the absolute filesystem path where the file
 *       was written. Exposed in API responses, revealing server directory
 *       structure. Client-supplied filename used as disk filename with no
 *       sanitisation -- path traversal possible (../../../etc/passwd).
 *       CWE-22 (Path Traversal) | A01:2025
 *       CWE-200 (Exposure of Sensitive Information) | A01:2025
 *       Remediation (v2.0.0): Canonicalise paths, chroot to uploads dir,
 *       strip storagePath from API responses.
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
