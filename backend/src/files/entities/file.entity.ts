import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * File entity (`file_entity`) — metadata for multipart uploads (v2.1.0).
 *
 * Historical (v1.0.0): ownerId unchecked (IDOR), client filename/path/MIME,
 * storagePath leaked in API — see Cycle-1 writeup.
 * Current: services enforce ownership; upload sanitizes names + size limits;
 * API DTOs omit storagePath. Sequential string IDs remain an accepted residual
 * (see Cycle-2 residuals / security-baseline).
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
