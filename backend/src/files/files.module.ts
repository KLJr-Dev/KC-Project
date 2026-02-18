import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Files module. Registers /files/* routes and service backed by PostgreSQL.
 * AuthModule imported to provide JwtService for JwtAuthGuard on controller.
 *
 * VULN (v0.2.2): ownerId is recorded on file creation but never checked
 *       on read/delete. Any authenticated user can access any file.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 */
@Module({
  imports: [TypeOrmModule.forFeature([FileEntity]), AuthModule],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
