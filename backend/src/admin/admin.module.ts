import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User } from '../users/entities/user.entity';
import { FileEntity } from '../files/entities/file.entity';
import { SharingEntity } from '../sharing/entities/sharing.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

/**
 * v0.4.1 — Admin Endpoints & Weak Guards
 *
 * Admin module manages administrative operations over User entities.
 * AuthModule imported to provide guards for role-based access.
 *
 * VULN (v0.4.1): HasRoleGuard trusts JWT role claim, doesn't re-check DB.
 * VULN (v0.4.1): Admin endpoints don't have rate limiting or audit trails.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, FileEntity, SharingEntity]), AuthModule, AuditModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
