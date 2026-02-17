import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Sharing record entity mapped to the "sharing_entity" table in PostgreSQL.
 * Represents a share link for a file. No foreign key to the files table —
 * intentionally weak referential integrity.
 *
 * Fields mirror the SharingResponseDto shape from v0.0.6. Sequential string
 * IDs are manually assigned (CWE-330).
 *
 * VULN: fileId is a plain string column with no foreign key constraint.
 *       A sharing record can reference a non-existent or deleted file.
 *       CWE-1188 (Insecure Default Initialization of Resource) | A05:2021
 *       Remediation (v2.0.0): Foreign key constraint on fileId → files.id.
 */
@Entity()
export class SharingEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  fileId!: string;

  @Column({ default: false })
  public!: boolean;

  @Column()
  createdAt!: string;

  @Column({ nullable: true })
  expiresAt!: string;
}
