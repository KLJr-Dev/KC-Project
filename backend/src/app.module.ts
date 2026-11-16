/**
 * M8 / v2.0.0 — Root AppModule.
 *
 * Security measures (M5/M8):
 * - CWE-532: TypeORM SQL logging off in production.
 * - CWE-307: Global ThrottlerGuard (loose) + tighter @Throttle on auth routes.
 * - CWE-798 residual: DB defaults still env-backed with weak lab fallbacks;
 *   prefer Docker secrets (*_FILE) documented in infra/.env.example.
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync, existsSync } from 'fs';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { AdminModule } from './admin/admin.module';
import { NotesModule } from './notes/notes.module';
import { PreviewModule } from './preview/preview.module';
import { OpsModule } from './ops/ops.module';
import { IntakeBffModule } from './intake-bff/intake-bff.module';
import { PacketsModule } from './packets/packets.module';

function dbSslOption():
  | boolean
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (process.env.DB_SSL !== 'true' && process.env.DB_SSL !== '1') {
    return undefined;
  }
  const caPath = process.env.DB_SSL_CA_PATH || '/run/secrets/db-ca.crt';
  const ca = existsSync(caPath) ? readFileSync(caPath, 'utf8') : undefined;
  return { rejectUnauthorized: true, ...(ca ? { ca } : {}) };
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: Number(process.env.THROTTLE_GLOBAL_LIMIT || 300),
      },
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME ?? 'kc_dev',
      ssl: dbSslOption(),
      autoLoadEntities: true,
      synchronize: false,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: process.env.MIGRATIONS_RUN !== 'false',
      logging: process.env.NODE_ENV !== 'production' && process.env.TYPEORM_LOGGING !== 'false',
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    SharingModule,
    AdminModule,
    NotesModule,
    PreviewModule,
    OpsModule,
    IntakeBffModule,
    PacketsModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
