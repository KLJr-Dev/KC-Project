/**
 * M8 / v2.0.0 — Root AppModule.
 *
 * Security measures (M5/M8):
 * - CWE-532: TypeORM SQL logging off in production.
 * - CWE-307: Global ThrottlerGuard (loose) + tighter @Throttle on auth routes.
 * - CWE-798 residual: DB defaults still env-backed with weak lab fallbacks;
 *   prefer Docker secrets (*_FILE) documented in infra/.env.example.
 */
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RequestLoggingInterceptor } from './common/interceptors/request-logging.interceptor';
import { AppThrottlerGuard } from './common/guards/app-throttler.guard';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        // Loose global ceiling; auth routes override via @Throttle
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
      autoLoadEntities: true,
      synchronize: false,
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true,
      logging:
        process.env.NODE_ENV !== 'production' && process.env.TYPEORM_LOGGING !== 'false',
    }),
    AuthModule,
    UsersModule,
    FilesModule,
    SharingModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: RequestLoggingInterceptor },
    { provide: APP_GUARD, useClass: AppThrottlerGuard },
  ],
})
export class AppModule {}
