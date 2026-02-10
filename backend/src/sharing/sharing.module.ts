import { Module } from '@nestjs/common';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Sharing module. Registers /sharing/* routes and stub service. No persistence.
 * Purpose: freeze API shape (CRUD + DTOs + mock responses). Real public links
 * and expiry (v0.3.4) come later.
 *
 * --- NestJS convention: Module as composition boundary ---
 * controllers[] and providers[] declare what this feature owns; framework
 * wires SharingController and SharingService.
 */
@Module({
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
