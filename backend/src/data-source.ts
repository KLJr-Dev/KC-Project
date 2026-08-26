import { DataSource } from 'typeorm';
import { User } from './users/entities/user.entity';
import { FileEntity } from './files/entities/file.entity';
import { SharingEntity } from './sharing/entities/sharing.entity';
import { AuditLog } from './admin/entities/audit-log.entity';
import { NoteEntity } from './notes/entities/note.entity';
import { LinkBookmarkEntity } from './preview/entities/link-bookmark.entity';

/**
 * Standalone DataSource for TypeORM CLI (migration:generate / run / revert).
 * Mirrors app connection settings; local CLI defaults use kc_dev credentials.
 * Production compose uses env-backed secrets (not these defaults).
 */
export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'kc_dev',
  entities: [User, FileEntity, SharingEntity, AuditLog, NoteEntity, LinkBookmarkEntity],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  // CLI migrations: keep SQL visible locally; prod app path uses AppModule gate
  logging: process.env.TYPEORM_LOGGING !== 'false',
});
