import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Files module. Registers /files/* routes and stub service. No filesystem,
 * no real upload/download. Purpose: freeze API shape (upload, download,
 * delete + DTOs + mock responses). Real file handling (v0.3.x) comes later.
 *
 * --- NestJS convention: Module as composition boundary ---
 * controllers[] and providers[] declare what this feature owns; framework
 * wires FilesController and FilesService.
 */
@Module({
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
