import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { SharingEntity } from '../sharing/entities/sharing.entity';
import { AuthModule } from '../auth/auth.module';
import { AuditModule } from '../audit/audit.module';

/**
 * Files module — /files routes + PostgreSQL-backed FilesService (v2.1.0).
 * Ownership and path containment enforced in controller/service (see Cycle-1 remediation).
 */

@Module({
  imports: [TypeOrmModule.forFeature([FileEntity, SharingEntity]), AuthModule, AuditModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
