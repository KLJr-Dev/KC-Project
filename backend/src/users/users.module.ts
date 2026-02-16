import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Users module. Registers /users/* routes and stub service. No persistence,
 * no auth. Purpose: freeze API shape (CRUD + DTOs + mock responses). Real
 * user management and persistence (v0.1.x, v0.2.x) come later.
 *
 * --- NestJS convention: Module as composition boundary ---
 * controllers[] and providers[] declare what this feature owns; framework
 * wires UsersController and UsersService.
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
