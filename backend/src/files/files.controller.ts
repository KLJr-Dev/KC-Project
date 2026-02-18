import { Body, Controller, Delete, Get, NotFoundException, Param, Post, UseGuards } from '@nestjs/common';
import { FilesService } from './files.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

/**
 * v0.2.3 — Enumeration Surface
 *
 * Files controller. RESTful resource at /files. All handlers are now
 * async because the service hits PostgreSQL via TypeORM. No real file
 * I/O — metadata only. Real file handling comes in v0.3.x.
 *
 * VULN (v0.2.2): JwtAuthGuard enforces authentication but no ownership
 *       checks exist. ownerId is recorded on upload but never verified
 *       on GET or DELETE. Any authenticated user can read or delete any
 *       file by supplying its sequential ID.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 *       CWE-862 (Missing Authorization) | A01:2025
 *       Remediation (v2.0.0): WHERE owner_id = user.sub on read/delete.
 *
 * VULN (v0.2.3): GET /files returns every record to any authenticated
 *       user — no pagination, no ownership filter, no limit. Full table
 *       dump including ownerIds. GET /files/:id with sequential IDs
 *       allows 200/404 existence probing (CWE-203).
 *       CWE-200 (Exposure of Sensitive Information) | A01:2025
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *       CWE-203 (Observable Discrepancy) | A01:2025
 */
@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  /** POST /files — persist file metadata. ownerId from JWT. */
  @Post()
  async upload(@Body() dto: UploadFileDto, @CurrentUser() user: JwtPayload) {
    return this.filesService.upload(dto, user.sub);
  }

  /** GET /files — return all file records, unbounded. No pagination. */
  @Get()
  async findAll() {
    return this.filesService.findAll();
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
