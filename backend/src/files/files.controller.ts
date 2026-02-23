import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
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
import { ApproveFileDto } from './dto/approve-file.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * v0.5.0 -- Real Multipart File Upload
 *
 * Files controller. Multipart file uploads via Multer diskStorage,
 * file download/streaming, and filesystem deletion. v0.5.0 emphasises
 * the real file I/O surface and intentional vulnerabilities in Multer
 * configuration, MIME handling, and access control.
 *
 * MULTIPART UPLOAD FLOW (v0.5.0):
 * 1. POST /files receives multipart/form-data with file + description
 * 2. FileInterceptor('file') invokes Multer diskStorage
 * 3. diskStorage.filename() callback uses client-supplied file.originalname
 *    as disk filename (no sanitisation, CWE-22)
 * 4. File written to ./uploads/<client-supplied-name>
 * 5. FilesService.upload() records: filename, mimetype, storagePath, size,
 *    uploadedAt, description
 * 6. FileResponseDto returned to client (storagePath exposed, CWE-200)
 * 7. File persisted to file_entity table with ownerId, approvalStatus
 *
 * VULN (v0.5.0 - CWE-22): Multer diskStorage uses client-supplied
 *       file.originalname directly as disk filename with no sanitisation.
 *       A filename containing "../" or absolute path escapes the uploads/
 *       directory and writes outside bounds.
 *       Remediation (v2.0.0): UUID or hashed filename, validate canonical path.
 *
 * VULN (v0.5.0 - CWE-400): No Multer fileSize limit configured.
 *       Unbounded file uploads; no per-file, per-user, or total storage quota.
 *       Remediation (v2.0.0): limits.fileSize on Multer, per-user quota checks.
 *
 * VULN (v0.5.0 - CWE-434): Client-supplied Content-Type header stored
 *       as mimetype with no magic-byte validation. A .html file can claim
 *       image/png; download endpoint returns this MIME type (CWE-434).
 *       Remediation (v2.0.0): file-type library for magic-byte detection.
 *
 * VULN (v0.2.2 - CWE-639): ownerId stored on upload but never checked
 *       on GET, /download, or DELETE. Any authenticated user can access
 *       or delete any file by ID (IDOR).
 *       Remediation (v2.0.0): WHERE ownerId = currentUserId on all queries.
 *
 * VULN (v0.5.0 - CWE-200): storagePath (absolute filesystem path) exposed
 *       in FileResponseDto and API responses. Reveals server directory
 *       structure to any authenticated user.
 *       Remediation (v2.0.0): Never expose storagePath in API responses.
 *
 * VULN (v0.3.2 - CWE-22): GET /files/:id/download streams file from
 *       storagePath without path validation. res.sendFile(storagePath)
 *       trusts the stored path. If storagePath is manipulated, arbitrary
 *       files could be downloaded.
 *       Remediation (v2.0.0): Validate storagePath is within uploads/ dir.
 *
 * VULN (v0.4.3 - CWE-862): PUT /files/:id/approve guarded by
 *       HasRole(['admin', 'moderator']) but trusts JWT role claim
 *       (no DB re-validation). Combined with CWE-639, a forged JWT
 *       grants unauthorized file approval.
 *
 * v0.5.0 SCOPE:
 * - Confirm Multer is configured correctly (no new code changes needed)
 * - Add comprehensive e2e tests for multipart upload surface
 * - Document CWE-22, CWE-400, CWE-434, CWE-200 intentional weaknesses
 * - Update backend README with v0.5.0 status
 * - Verify file storage and metadata persistence
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

  /**
   * PUT /files/:id/approve -- Moderator or admin approves/rejects file.
   *
   * v0.4.3: New endpoint for file approval workflow. Open to moderators and admins.
   *
   * VULN (v0.4.3 - CWE-639 Extended): HasRole(['admin', 'moderator']) trusts JWT role
   *       without database validation. An attacker who forges a JWT with role='moderator'
   *       (knowing the hardcoded secret 'kc-secret') can approve arbitrary files.
   *       This endpoint is directly reachable by forged tokens.
   *       Remediation (v2.0.0): Server-side role re-validation from database on every request.
   *
   * VULN (v0.4.3 - CWE-862): No additional authorization checks. Any moderator/admin
   *       can approve ANY file, not just files they own or uploaded. Combined with
   *       CWE-641 (lack of conflict detection), moderator could approve file, admin
   *       could reject it, triggering race conditions or permission confusion.
   *       Remediation (v2.0.0): Ownership checks, approval audit trail, re-review required
   *       for status changes.
   *
   * VULN (v0.4.3 - CWE-841): Role hierarchy is ambiguous. The ternary system
   *       (user/moderator/admin) does not define if moderator can override admin
   *       decisions or vice versa. This intentional ambiguity surfaces during pen-testing.
   *       Remediation (v2.0.0): Explicit role hierarchy constants, documented permission matrix.
   */
  @Put(':id/approve')
  @HasRole(['admin', 'moderator'])
  async approveFile(
    @Param('id') id: string,
    @Body() dto: ApproveFileDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const updated = await this.filesService.approveFile(id, dto.status);
    if (!updated) throw new NotFoundException();
    return updated;
  }
}
