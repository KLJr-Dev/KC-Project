import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * v0.3.3 -- File Deletion (filesystem)
 *
 * Files controller. Multipart file uploads via Multer diskStorage,
 * file download/streaming, and filesystem deletion.
 *
 * VULN (v0.2.2): JwtAuthGuard enforces authentication but no ownership
 *       checks exist. ownerId is recorded on upload but never verified
 *       on GET, download, or DELETE. Any authenticated user can read,
 *       download, or delete any file by supplying its sequential ID.
 *       CWE-639 | A01:2025, CWE-862 | A01:2025
 *
 * VULN (v0.3.0): Multer diskStorage uses the client-supplied original
 *       filename as the disk filename with no sanitisation. A filename
 *       containing "../" writes outside the uploads directory.
 *       CWE-22 (Path Traversal) | A01:2025
 *       No file size limit configured on Multer.
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *       Remediation (v2.0.0): Sanitise filenames, enforce size limits,
 *       canonicalise paths.
 *
 * VULN (v0.3.0): Client-supplied Content-Type stored as mimetype.
 *       No magic-byte validation. CWE-434 | A06:2025
 *
 * VULN (v0.3.2): Download endpoint streams file from storagePath with
 *       no path validation. Sets Content-Type from stored mimetype
 *       (client-controlled). CWE-22 | A01:2025, CWE-434 | A06:2025
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /**
   * POST /files -- multipart file upload.
   * VULN: client filename used as disk filename (CWE-22).
   * VULN: no file size limit (CWE-400).
   * VULN: mimetype from client header (CWE-434).
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.filesService.upload(file, dto, user.sub);
  }

  /** GET /files -- return all file records, unbounded. No pagination. */
  @Get()
  async findAll() {
    return this.filesService.findAll();
  }

  /** GET /files/:id -- return file metadata or 404. */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const file = await this.filesService.getById(id);
    if (!file) throw new NotFoundException();
    return file;
  }

  /**
   * GET /files/:id/download -- stream file from disk.
   * VULN: no ownership check (CWE-639).
   * VULN: no path validation on storagePath (CWE-22).
   * VULN: Content-Type from client-supplied mimetype (CWE-434).
   */
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const meta = await this.filesService.getFileMeta(id);
    if (!meta || !meta.storagePath) throw new NotFoundException();

    if (!existsSync(meta.storagePath)) throw new NotFoundException();

    res.set('Content-Type', meta.mimetype || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${meta.filename}"`);
    res.sendFile(meta.storagePath);
  }

  /**
   * DELETE /files/:id -- remove file record AND file from disk.
   * VULN: no ownership check (CWE-639).
   * VULN: no path validation before fs.unlink (CWE-22).
   */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const ok = await this.filesService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
