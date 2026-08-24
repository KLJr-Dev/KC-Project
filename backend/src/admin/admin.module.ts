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
 * Admin module — administrative operations over User / audit entities.
 * AuthModule provides JwtAuthGuard + HasRoleGuard (DB role is authoritative).
 */
@Module({
  imports: [TypeOrmModule.forFeature([User, FileEntity, SharingEntity]), AuthModule, AuditModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
