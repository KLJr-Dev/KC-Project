import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * File metadata entity mapped to the "file_entity" table in PostgreSQL.
 * No actual file bytes are stored — this records upload metadata only.
 * Real file I/O (local filesystem storage, streaming) comes in v0.3.x.
 *
 * Fields mirror the FileResponseDto shape from v0.0.6. Sequential string
 * IDs are manually assigned (CWE-330).
 *
 * VULN (v0.2.2): ownerId is stored at creation time but never checked on
 *       read or delete operations. Any authenticated user who knows (or
 *       guesses) the file ID can access or delete another user's file.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2021
 *       Remediation (v2.0.0): WHERE owner_id = $1 on every query.
 *
 * VULN (v0.2.2): ownerId has no foreign key constraint to the user table.
 *       A file can reference a non-existent or deleted user.
 *       CWE-1188 (Insecure Default Initialization of Resource) | A05:2021
 *       Remediation (v2.0.0): FK constraint on ownerId → users.id.
 */
@Entity()
export class FileEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  ownerId!: string;

  @Column()
  filename!: string;

  @Column({ type: 'int', default: 0 })
  size!: number;

  @Column()
  uploadedAt!: string;
}
