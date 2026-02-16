import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Auth module. Registers /auth/* routes and stub service. No persistence,
 * no real authentication. Purpose: freeze API shape (register, login, DTOs,
 * mock responses). Real auth (v0.1.x) and sessions (v0.1.3) come later.
 *
 * --- NestJS convention: Module as composition boundary ---
 * Same as admin: controllers[] and providers[] declare what this feature
 * owns. AuthController and AuthService are instantiated and wired by the
 * framework.
 */
@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
