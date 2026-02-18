import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

/**
 * v0.2.3 — Enumeration Surface
 *
 * Sharing controller. RESTful resource at /sharing. All handlers are now
 * async because the service hits PostgreSQL via TypeORM.
 *
 * VULN (v0.2.2): JwtAuthGuard enforces authentication but no ownership
 *       checks exist. ownerId is recorded on creation but never verified
 *       on read, update, or delete. Any authenticated user can access
 *       any sharing record.
 *       CWE-639 | A01:2025, CWE-862 | A01:2025
 *
 * VULN (v0.2.3): GET /sharing returns every record unbounded — no
 *       pagination, no ownership filter. CWE-200 | A01:2025,
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025, CWE-203 | A01:2025
 */
@Controller('sharing')
@UseGuards(JwtAuthGuard)
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  /** POST /sharing — create share record. ownerId from JWT. */
  @Post()
  async create(@Body() dto: CreateSharingDto, @CurrentUser() user: JwtPayload) {
    return this.sharingService.create(dto, user.sub);
  }

  /** GET /sharing — list all share records. */
  @Get()
  async read() {
    return this.sharingService.read();
  }

  /** GET /sharing/:id — single share or 404. */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const share = await this.sharingService.getById(id);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** PUT /sharing/:id — update share or 404. */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSharingDto) {
    const share = await this.sharingService.update(id, dto);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** DELETE /sharing/:id — remove share or 404. */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const ok = await this.sharingService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
