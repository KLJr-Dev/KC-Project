import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.3.4 -- Public File Sharing
 *
 * Sharing record entity mapped to the "sharing_entity" table in PostgreSQL.
 * Represents a share link for a file. No foreign key to the files table.
 *
 * publicToken: crypto-random hex (v2.0.0). Demo seed uses DEMO_WELCOME_SHARE_TOKEN.
 * expiresAt: enforced on public access (v2.0.0); empty means no expiry.
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
