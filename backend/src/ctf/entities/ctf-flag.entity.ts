import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * Cycle-3 CTF flags (ctf/leak-crack-db).
 * local — readable via CTF_MODE SQLi as kc_app (RLS).
 * proof — readable only as ctf_ro after John.
 */
@Entity({ name: 'ctf_flags' })
export class CtfFlag {
  @PrimaryColumn()
  id!: string;

  @Column()
  tier!: 'local' | 'proof';

  @Column({ length: 32 })
  flag!: string;

  @Column({ nullable: true })
  label?: string;
}
