import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * v0.2.4 — Error & Metadata Leakage
 *
 * Admin controller. RESTful resource at /admin. All handlers are now
 * async because the service hits PostgreSQL via TypeORM.
 *
 * VULN (v0.2.2): JwtAuthGuard enforces authentication but any
 *       authenticated user (not just admins) can access all admin
 *       endpoints. No role or privilege check exists.
 *       CWE-862 (Missing Authorization) | A01:2025
 *       CWE-639 | A01:2025
 *
 * VULN (v0.2.3): GET /admin returns every record unbounded — no
 *       pagination, no limit. CWE-200 | A01:2025,
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025, CWE-203 | A01:2025
 *
 * VULN (v0.2.4): GET /admin/crash-test deliberately throws an unhandled
 *       Error. NestJS default ExceptionsHandler returns a generic
 *       {"statusCode":500,"message":"Internal server error"} to the client
 *       but logs the full stack trace (including file paths and line
 *       numbers) to stdout. Demonstrates A10:2025 (Mishandling of
 *       Exceptional Conditions) — no global exception filter, no
 *       sanitisation, no graceful recovery.
 *       CWE-209 (Error Message Info Leak) | A10:2025
 */
@Controller('admin')
@UseGuards(JwtAuthGuard)
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

  /**
   * GET /admin/crash-test — deliberately throws an unhandled Error.
   * Must be declared before @Get(':id') to avoid route collision.
   */
  @Get('crash-test')
  async crashTest() {
    throw new Error('Intentional crash for leakage testing');
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
