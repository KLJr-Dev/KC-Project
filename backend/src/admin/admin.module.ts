import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Admin module. Registers /admin/* routes and stub service. No persistence,
 * no auth. Purpose: freeze API shape (controllers + DTOs + mock responses)
 * for this namespace. Real admin behaviour (e.g. v0.4.x) comes later.
 *
 * --- NestJS convention: Module as composition boundary ---
 * @Module() declares what this feature "owns": which controllers handle HTTP
 * and which providers (services, etc.) are available. The framework instantiates
 * these and injects dependencies (e.g. AdminService into AdminController).
 * Only classes listed in controllers[] and providers[] are part of this
 * module's public surface; other modules must import AdminModule to use it.
 */
@Module({
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
