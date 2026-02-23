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
   * GET /files/:id/download -- Stream file from disk to client.
   * 
   * v0.5.1: File download & streaming endpoint. Returns file content as attachment
   * with correct Content-Type and Content-Disposition headers. Supports all file sizes
   * via Express streaming (sendFile with piping).
   * 
   * Behavior:
   * 1. Fetch file metadata from database by ID
   * 2. Verify file exists on disk (storagePath)
   * 3. Set Content-Type from stored MIME type (or application/octet-stream default)
   * 4. Set Content-Disposition: attachment with filename for browser download
   * 5. Stream file content via Express res.sendFile() (efficient piping)
   * 
   * Response:
   * - 200 OK: File stream with headers (Content-Type, Content-Disposition, Content-Length)
   * - 404 Not Found: File ID doesn't exist or disk storage missing
   * - 401 Unauthorized: No or invalid JWT token
   * 
   * OpenAPI: application/octet-stream (binary response)
   * 
   * VULN (v0.5.1 - CWE-639 IDOR): No ownership check. Any authenticated user
   *       can download any file uploaded by any other user. Combined with CWE-200
   *       (storagePath exposed in metadata), attacker can:
   *       1. List all files via GET /files (unbounded)
   *       2. Fetch metadata including storagePath of any file
   *       3. Download file with GET /files/:id/download (no ownership validation)
   *       Severity: HIGH - Full file confidentiality breach.
   *       Remediation (v2.0.0): Check file.ownerId == currentUser.id before streaming.
   *       Except: Admin/moderator can download if approval workflow requires review.
   * 
   * VULN (v0.5.1 - CWE-22 Path Traversal): storagePath used directly in sendFile()
   *       without validation. If storagePath contains absolute path to system file
   *       (e.g., "/etc/passwd"), and database can be poisoned via SQL injection or
   *       race condition, attacker could read arbitrary system files.
   *       Current risk: LOW (storagePath generated by multer, not user input).
   *       But if migration or direct DB update allowed attacker to set:
   *         storagePath = "/etc/shadow"
   *       Then GET /files/:id/download would leak /etc/shadow content.
   *       Remediation (v2.0.0): Whitelist storagePath to uploadDir; reject if
   *       path.resolve(storagePath).startsWith(uploadDir) === false.
   * 
   * VULN (v0.5.1 - CWE-434 MIME Type Confusion): mimetype stored from client
   *       (via multer Content-Type header) without validation. Attacker uploads
   *       .txt file claiming mimetype='application/javascript', server stores
   *       mimetype='application/javascript'. On download, Content-Type is set to
   *       application/javascript, causing browser to execute as script (XSS).
   *       Attack Flow:
   *         1. Upload malicious.txt with Content-Type: application/javascript
   *         2. Server stores: { filename: 'malicious.txt', mimetype: 'application/javascript' }
   *         3. Download returns: Content-Type: application/javascript; body = malicious.txt
   *         4. Browser <script src="/download"> executes JavaScript
   *       Remediation (v1.0.0): Server detects MIME from file content (magic bytes)
   *       using file library or libmagic. Whitelist safe MIME types (pdf, image/*, etc).
   *       Do NOT trust Content-Type header.
   * 
   * VULN (v0.5.1 - CWE-200 Information Disclosure): storagePath exposed in
   *       GET /files/:id metadata endpoint. Reveals internal file storage structure:
   *       /home/kc/KC-Project-1/backend/uploads/abc123-filename.ext
   *       Attacker learns:
   *       - Application directory structure (/home/kc/...)
   *       - Storage location (/backend/uploads)
   *       - Filename pattern (UUID prefix)
   *       Combined with CWE-22 and CWE-639, attacker can map attack surface.
   *       Remediation (v2.0.0): Remove storagePath from API response.
   *       Send file ID and filename only; keep storagePath server-side secret.
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
