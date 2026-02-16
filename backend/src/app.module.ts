import { Module } from '@nestjs/common';

import { AppController } from './app.controller';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilesModule } from './files/files.module';
import { SharingModule } from './sharing/sharing.module';
import { AdminModule } from './admin/admin.module';

/**
 * Root application module.
 *
 * This module does NOT contain business logic.
 * Its sole responsibility is to:
 * - compose feature modules
 * - define application boundaries
 * - bootstrap the backend
 *
 * Feature modules encapsulate domain behaviour.
 */
@Module({
  imports: [AuthModule, UsersModule, FilesModule, SharingModule, AdminModule],
  controllers: [AppController], // infrastructure-only (/ping)
})
export class AppModule {}
