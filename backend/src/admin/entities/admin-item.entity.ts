import { Entity, PrimaryColumn, Column } from 'typeorm';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Admin item entity mapped to the "admin_item" table in PostgreSQL.
 * Represents an administrative record (placeholder — real admin behaviour
 * comes in v0.4.x).
 *
 * Fields mirror the AdminResponseDto shape from v0.0.6. Sequential string
 * IDs are manually assigned (CWE-330).
 */
@Entity()
export class AdminItem {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  label!: string;

  @Column({ nullable: true })
  role!: string;

  @Column()
  createdAt!: string;
}
