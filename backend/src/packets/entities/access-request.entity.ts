/**
 * Document Ops staff access request (Cycle-10 Blue / v2.10.0).
 *
 * Public submit creates a pending row only — never a User with elevated role.
 * Admin approve creates the account and grants moderator (A01).
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

export type AccessRequestStatus = 'pending' | 'approved' | 'denied';

@Entity('access_request')
export class AccessRequestEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  email!: string;

  @Column()
  username!: string;

  /** bcrypt hash — never returned from API DTOs. */
  @Column()
  passwordHash!: string;

  @Column({ type: 'text', default: '' })
  justification!: string;

  @Column({ type: 'varchar', default: 'pending' })
  status!: AccessRequestStatus;

  @Column()
  createdAt!: string;

  @Column({ type: 'varchar', nullable: true })
  reviewedAt!: string | null;

  @Column({ type: 'varchar', nullable: true })
  reviewedBy!: string | null;
}
