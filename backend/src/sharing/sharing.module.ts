import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { SharingEntity } from './entities/sharing.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Sharing module. Registers /sharing/* routes and service backed by PostgreSQL.
 * AuthModule imported to provide JwtService for JwtAuthGuard on controller.
 *
 * VULN (v0.2.2): ownerId is recorded on share creation but never checked
 *       on read/update/delete. Any authenticated user can access any share.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2021
 */
@Module({
  imports: [TypeOrmModule.forFeature([SharingEntity]), AuthModule],
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
