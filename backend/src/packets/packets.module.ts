/**
 * Cycle-10 SoftDev — Document Packets + Stage-0 access grant (`v1.10.0`).
 *
 * Owns:
 * - Nest `/packets` API (moderator RBAC → docproc helper plant)
 * - Public `/access-requests` (creates moderator, never admin)
 *
 * Authority:
 * - ADR-039 · docs/security/Cycle-10/Dev/cycle-10-decisions.md
 * - docs/security/Cycle-10/Dev/packets-openapi-stub.yaml
 * - docs/security/Cycle-10/Dev/v1.10.0-auth-flow.md
 *
 * Markers: CYCLE10-PLANT on helper invocation + access-grant role elevation.
 * Must not: re-break C6–C9 closed plants; grant admin via Stage 0.
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { DocumentPacket } from './entities/document-packet.entity';
import { PacketsController } from './packets.controller';
import { PacketsService } from './packets.service';
import { AccessRequestsController } from './access-requests.controller';
import { AccessRequestsService } from './access-requests.service';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentPacket, User]), AuthModule],
  controllers: [PacketsController, AccessRequestsController],
  providers: [PacketsService, AccessRequestsService],
  exports: [PacketsService],
})
export class PacketsModule {}
