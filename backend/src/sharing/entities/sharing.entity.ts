import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.3.4 -- Public File Sharing
 *
 * Sharing record entity mapped to the "sharing_entity" table in PostgreSQL.
 * Represents a share link for a file. No foreign key to the files table.
 *
 * VULN: fileId has no FK constraint. CWE-1188 | A02:2025
 * VULN (v0.2.2): ownerId never checked. CWE-639 | A01:2025
 *
 * VULN (v0.3.4): publicToken is sequential ("share-1", "share-2", ...).
 *       Trivially guessable -- enumerate all shared files.
 *       CWE-330 (Predictable Values) | A01:2025
 *       Remediation (v2.0.0): crypto.randomBytes(32).toString('hex').
 *
 * VULN (v0.3.4): expiresAt is stored but never checked on access.
 *       Expired shares remain accessible indefinitely.
 *       CWE-613 (Insufficient Session Expiration) | A07:2025
 *       Remediation (v2.0.0): Check expiresAt on every public access.
 */
@Entity()
export class SharingEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  ownerId!: string;

  @Column({ nullable: true })
  fileId!: string;

  @Column({ nullable: true })
  publicToken?: string;

  @Column({ default: false })
  public!: boolean;

  @Column()
  createdAt!: string;

  @Column({ nullable: true })
  expiresAt!: string;
}
