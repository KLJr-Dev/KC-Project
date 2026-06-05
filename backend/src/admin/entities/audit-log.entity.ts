import { Column, Entity, PrimaryColumn } from 'typeorm';

/**
 * v0.6.0 — Persistent audit log (CWE-532: readable by any authenticated user via weak guard).
 */
@Entity('audit_log')
export class AuditLog {
  @PrimaryColumn()
  id!: string;

  @Column()
  actorId!: string;

  @Column()
  action!: string;

  @Column({ default: '' })
  targetId!: string;

  @Column({ type: 'text', default: '' })
  details!: string;

  @Column()
  createdAt!: string;
}
