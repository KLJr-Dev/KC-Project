import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Admin controller. RESTful resource at /admin. All handlers return
 * mock/placeholder data. No persistence, no auth, no frontend dependency.
 * This version freezes API shape only.
 *
 * --- NestJS convention: Controller = thin HTTP layer ---
 * @Controller('admin') mounts all routes under /admin. HTTP verb determines
 * the action (POST = create, GET = read, PUT = update, DELETE = delete).
 * Business logic lives in the service so it can be tested and reused without
 * HTTP. Constructor injection: Nest injects AdminService because it's in the
 * same module's providers[]. We never `new AdminService()` — the framework
 * manages a single instance (singleton per module).
 *
 * --- Route decorators ---
 * @Get(), @Post(), @Put(), @Delete() map HTTP method + path segment to a
 * method. Path is relative to @Controller('admin'), so @Get(':id') => GET
 * /admin/:id. @Param('id') and @Body() automatically bind request data to
 * method arguments; no manual req.params or req.body.
 */
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /** v0.0.6 — POST /admin. Body parsed into CreateAdminDto by Nest. */
  @Post()
  create(@Body() dto: CreateAdminDto) {
    return this.adminService.create(dto);
  }

  /** v0.0.6 — GET /admin. Returns list; 200 always for stub. */
  @Get()
  read() {
    return this.adminService.read();
  }

  /** v0.0.6 — GET /admin/:id. 404 if id not in mock list. */
  @Get(':id')
  getById(@Param('id') id: string) {
    const item = this.adminService.getById(id);
    if (!item) throw new NotFoundException();
    return item;
  }

  /** v0.0.6 — PUT /admin/:id. 404 if id not found. */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAdminDto) {
    const item = this.adminService.update(id, dto);
    if (!item) throw new NotFoundException();
    return item;
  }

  /** v0.0.6 — DELETE /admin/:id. 404 if id not found. */
  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.adminService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
