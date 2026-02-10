import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Files controller. RESTful resource at /files. All handlers return
 * mock/placeholder data. No real file I/O, no storage. This version freezes
 * API shape only.
 *
 * --- NestJS convention: Controller = thin HTTP layer ---
 * @Controller('files') mounts all routes under /files. Upload/download/delete
 * are stubs: we return metadata only. Real multipart upload and stream
 * download come in v0.3.x. Constructor injection of FilesService; 404 on
 * missing id for download/delete.
 */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /** v0.0.6 — POST /files. Body parsed into UploadFileDto; no file bytes processed. */
  @Post()
  upload(@Body() dto: UploadFileDto) {
    return this.filesService.upload(dto);
  }

  /** v0.0.6 — GET /files/:id. Returns file metadata stub only; no stream. */
  @Get(':id')
  download(@Param('id') id: string) {
    const file = this.filesService.getById(id);
    if (!file) throw new NotFoundException();
    return file;
  }

  /** v0.0.6 — DELETE /files/:id. 404 if id not found. */
  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.filesService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
