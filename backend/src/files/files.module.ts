import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { FileEntity } from './entities/file.entity';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Files module. Registers /files/* routes and service backed by PostgreSQL.
 * TypeOrmModule.forFeature() registers the FileEntity repository so it
 * can be injected into FilesService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([FileEntity])],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
