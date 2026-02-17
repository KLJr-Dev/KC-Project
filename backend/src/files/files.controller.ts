import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Files controller. RESTful resource at /files. All handlers are now
 * async because the service hits PostgreSQL via TypeORM. No real file
 * I/O — metadata only. Real file handling comes in v0.3.x.
 */
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /** POST /files — persist file metadata. */
  @Post()
  async upload(@Body() dto: UploadFileDto) {
    return this.filesService.upload(dto);
  }

  /** GET /files/:id — return file metadata or 404. */
  @Get(':id')
  async download(@Param('id') id: string) {
    const file = await this.filesService.getById(id);
    if (!file) throw new NotFoundException();
    return file;
  }

  /** DELETE /files/:id — remove file record or 404. */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const ok = await this.filesService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
