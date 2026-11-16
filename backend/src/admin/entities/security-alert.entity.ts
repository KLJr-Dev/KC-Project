/**
 * Thin Nest security alerts (Cycle-10 Blue / ADR-039).
 * Not a SIEM — admin Defense Ops ack queue only.
 */
import { Column, Entity, PrimaryColumn } from 'typeorm';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

@Entity('security_alert')
export class SecurityAlert {
  @PrimaryColumn()
  id!: string;

  @Column()
  severity!: AlertSeverity;

  @Column()
  kind!: string;

  @Column({ type: 'text' })
  message!: string;

  @Column({ default: '' })
  sourceAction!: string;

  @Column({ default: false })
  acked!: boolean;

  @Column()
  createdAt!: string;
}
