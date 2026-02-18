import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { AdminModule } from './admin/admin.module';

/**
 * v0.2.5 — Persistence Refactoring
 *
 * Root application module. Composes feature modules and configures the
 * PostgreSQL connection via TypeORM.
 *
 * VULN: Database credentials are hardcoded directly in source code.
 *       Anyone who reads the repo knows the superuser password.
 *       CWE-798 (Use of Hard-coded Credentials) | A07:2025
 *       Remediation (v2.0.0): Load from environment variables or
 *       Docker secrets, never commit credentials to source.
 *
 * VULN (v0.2.5 partial remediation): synchronize: true replaced with
 *       explicit TypeORM migrations + migrationsRun: true. Migrations
 *       are better than auto-sync, but migrationsRun: true means any
 *       migration file injected into the repo executes automatically
 *       on app start — still a design weakness.
 *       CWE-1188 (Insecure Default Initialization of Resource) | A02:2025
 *       Remediation (v2.0.0): Manual migration execution, migration review gate.
 *
 * VULN: logging: true prints all SQL statements to stdout, including
 *       queries containing plaintext passwords and user data.
 *       CWE-532 (Insertion of Sensitive Information into Log File) | A09:2025
 *       Remediation (v2.0.0): Disable query logging or redact sensitive fields.
 *
 * VULN (v0.2.1 expanded v0.2.4): No global exception filter. ALL
 *       unhandled exceptions — TypeORM QueryFailedError, plain Error,
 *       TypeError from malformed input — are caught by NestJS default
 *       ExceptionsHandler which returns generic 500 to the client but
 *       logs the full stack trace (file paths, line numbers, PG table
 *       names, constraint names, SQL with parameters) to stdout.
 *       CWE-209 (Error Message Info Leak) | A02:2025, A10:2025
 *       CWE-532 (Sensitive Info in Logs) | A09:2025
 *       Remediation (v2.0.0): Global ExceptionFilter that catches all
 *       errors, logs sanitised messages, and returns user-friendly responses.
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
      synchronize: false, // v0.2.5: replaced with migrations (was true, CWE-1188 partial fix)
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true, // VULN: auto-runs migrations on start (CWE-1188 still partial)
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
