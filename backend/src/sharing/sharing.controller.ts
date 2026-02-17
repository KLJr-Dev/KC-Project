import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { SharingService } from './sharing.service';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Sharing controller. RESTful resource at /sharing. All handlers are now
 * async because the service hits PostgreSQL via TypeORM.
 */
@Controller('sharing')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  /** POST /sharing — create share record. */
  @Post()
  async create(@Body() dto: CreateSharingDto) {
    return this.sharingService.create(dto);
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
