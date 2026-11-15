/**
 * Cycle-10 — `document_packet` table (kc_prod).
 *
 * SoftDev B6a migration: 1777900000000-CreateDocumentPacket.ts
 * Data model notes: docs/security/Cycle-10/Dev/v1.10.0-data-model.md
 *
 * `originalName` retains client filename (plant surface for helper).
 * `helperOutput` stores truncated docproc response for SoftDev/debug.
 */
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('document_packet')
export class DocumentPacket {
  @PrimaryColumn()
  id!: string;

  @Column()
  ownerUserId!: string;

  /** Client-supplied filename — intentionally preserved for CYCLE10-PLANT. */
  @Column()
  originalName!: string;

  @Column({ nullable: true })
  storageKey?: string;

  @Column({ default: 'accepted' })
  status!: string;

  @Column({ type: 'text', nullable: true })
  helperOutput?: string;

  @Column()
  createdAt!: string;
}
