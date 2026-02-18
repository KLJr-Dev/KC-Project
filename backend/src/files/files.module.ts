import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * v0.3.4 -- Public File Sharing
 *
 * Files module. Registers /files/* routes and service backed by PostgreSQL.
 * AuthModule imported to provide JwtService for JwtAuthGuard on controller.
 * FilesService exported so SharingModule can stream files for public shares.
 *
 * VULN (v0.2.2): ownerId never checked on read/delete. CWE-639 | A01:2025
 */
@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), AuthModule],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
