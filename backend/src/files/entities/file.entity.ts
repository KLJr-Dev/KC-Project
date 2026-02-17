import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * File metadata entity mapped to the "file_entity" table in PostgreSQL.
 * No actual file bytes are stored — this records upload metadata only.
 * Real file I/O (local filesystem storage, streaming) comes in v0.3.x.
 *
 * Fields mirror the FileResponseDto shape from v0.0.6. Sequential string
 * IDs are manually assigned (CWE-330).
 */
@Entity()
export class FileEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  filename!: string;

  @Column({ type: 'int', default: 0 })
  size!: number;

  @Column()
  uploadedAt!: string;
}
