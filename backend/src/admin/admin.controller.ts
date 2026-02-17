import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Admin controller. RESTful resource at /admin. All handlers are now
 * async because the service hits PostgreSQL via TypeORM.
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** POST /admin — create admin item. */
  @Post()
  async create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  /** GET /admin — list all admin items. */
  @Get()
  async read() {
    return this.adminService.read();
  }

  /** GET /admin/:id — single admin item or 404. */
  @Get(':id')
  async getById(@Param('id') id: string) {
    const item = await this.adminService.getById(id);
    if (!item) throw new NotFoundException();
    return item;
  }

  /** PUT /admin/:id — update admin item or 404. */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const item = await this.adminService.update(id, dto);
    if (!item) throw new NotFoundException();
    return item;
  }

  /** DELETE /admin/:id — remove admin item or 404. */
  @Delete(':id')
  async delete(@Param('id') id: string) {
    const ok = await this.adminService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
