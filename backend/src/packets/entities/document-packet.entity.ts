/**
 * `document_packet` table (kc_prod) — Cycle-10 Document Ops.
 * `originalName` is allowlisted before helper invoke; `helperOutput` is redacted.
 */
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('document_packet')
export class DocumentPacket {
  @PrimaryColumn()
  id!: string;

  @Column()
  ownerUserId!: string;

  /** Client filename after basename + allowlist sanitization. */
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
