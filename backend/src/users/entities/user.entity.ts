/**
 * User entity — account row in PostgreSQL.
 *
 * M5 security measures:
 * - CWE-256: `password` column stores a bcrypt hash (cost ≥ 12), never plaintext
 *   for new writes (UsersService) and demo seeds (migrations).
 * - Role column uses user_role_enum; rank checks use ROLE_RANK in auth/roles.ts
 *   (CWE-841), not this entity alone.
 *
 * Residual: sequential string IDs (CWE-330) — accepted until later milestone.
 */
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('user')
export class User {
  @PrimaryColumn()
  id!: string;

  @Column()
  email!: string;

  @Column()
  username!: string;

  /** bcrypt hash (M5). Never return this field from API DTOs. */
  @Column()
  password!: string;

  @Column({ type: 'enum', enum: ['user', 'moderator', 'admin'], default: 'user' })
  role!: 'user' | 'moderator' | 'admin';

  @Column()
  createdAt!: string;

  @Column()
  updatedAt!: string;
}
