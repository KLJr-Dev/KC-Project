import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { AdminModule } from './admin/admin.module';

/**
 * v0.2.1 — Persisted Authentication
 *
 * Root application module. Composes feature modules and configures the
 * PostgreSQL connection via TypeORM.
 *
 * VULN: Database credentials are hardcoded directly in source code.
 *       Anyone who reads the repo knows the superuser password.
 *       CWE-798 (Use of Hard-coded Credentials) | A07:2021
 *       Remediation (v2.0.0): Load from environment variables or
 *       Docker secrets, never commit credentials to source.
 *
 * VULN: synchronize: true auto-creates and alters tables from entity
 *       metadata on every application start. In production this can
 *       cause data loss or schema corruption.
 *       CWE-1188 (Insecure Default Initialization of Resource) | A05:2021
 *       Remediation (v2.0.0): synchronize: false, use TypeORM migrations.
 *
 * VULN: logging: true prints all SQL statements to stdout, including
 *       queries containing plaintext passwords and user data.
 *       CWE-532 (Insertion of Sensitive Information into Log File) | A09:2021
 *       Remediation (v2.0.0): Disable query logging or redact sensitive fields.
 *
 * VULN (v0.2.1): No global exception filter. When TypeORM throws a
 *       QueryFailedError (e.g. duplicate PK, constraint violation), the
 *       request crashes with a generic 500. The raw error — including PG
 *       table names, constraint names, and full SQL with parameters — is
 *       logged to stdout (CWE-532). The 500 confirms a DB failure to the
 *       attacker, and no graceful recovery or retry logic exists.
 *       CWE-209 (Generation of Error Message Containing Sensitive Information) | A05:2021
 *       Remediation (v2.0.0): Add a global ExceptionFilter that catches
 *       TypeORM errors, logs a sanitised message, and returns a user-friendly error.
 */
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres', // VULN: hardcoded credentials (CWE-798)
      password: 'postgres', // VULN: hardcoded credentials (CWE-798)
      database: 'kc_dev',
      autoLoadEntities: true,
      synchronize: true, // VULN: auto-alters schema in place (CWE-1188)
      logging: true, // VULN: logs all SQL including sensitive data (CWE-532)
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    SharingModule,
    AdminModule,
  ],
  controllers: [AppController], // infrastructure-only (/ping)
})
export class AppModule {}
