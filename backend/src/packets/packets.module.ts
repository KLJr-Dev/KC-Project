/**
 * Document Packets + Document Ops access requests (Cycle-10 / v2.10.0).
 *
 * - `/packets` — moderator|admin RBAC; helper invoke is sanitized (A03)
 * - `/access-requests` — public pending tickets; elevation is admin-only (A01)
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';
import { User } from '../users/entities/user.entity';
import { DocumentPacket } from './entities/document-packet.entity';
import { AccessRequestEntity } from './entities/access-request.entity';
import { PacketsController } from './packets.controller';
import { PacketsService } from './packets.service';
import { AccessRequestsController } from './access-requests.controller';
import { AccessRequestsService } from './access-requests.service';
import { AdminAccessRequestsController } from './admin-access-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentPacket, User, AccessRequestEntity]),
    AuthModule,
    AuditModule,
  ],
  controllers: [
    PacketsController,
    AccessRequestsController,
    AdminAccessRequestsController,
  ],
  providers: [PacketsService, AccessRequestsService],
  exports: [PacketsService, AccessRequestsService],
})
export class PacketsModule {}
