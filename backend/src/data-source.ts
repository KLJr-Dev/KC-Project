import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { FileEntity } from './files/entities/file.entity';
import { SharingEntity } from './sharing/entities/sharing.entity';
import { AuditLog } from './admin/entities/audit-log.entity';

/**
 * v0.2.5 — Persistence Refactoring
 *
 * Standalone DataSource configuration for TypeORM CLI.
 * Used by migration:generate, migration:run, migration:revert scripts.
 * Duplicates the connection config from app.module.ts.
 *
 * VULN: Same hardcoded credentials as app.module.ts (CWE-798 | A07:2025).
 */
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'kc_dev',
  entities: [User, FileEntity, SharingEntity, AuditLog],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
