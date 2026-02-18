import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * v0.2.3 — Enumeration Surface
 *
 * Users controller. RESTful resource at /users. Thin HTTP layer that
 * delegates to UsersService. All handlers are now async because the
 * service hits PostgreSQL via TypeORM.
 *
 * VULN (v0.2.2): JwtAuthGuard enforces authentication (valid JWT required)
 *       but no authorization or ownership checks exist. Any authenticated
 *       user can read, modify, or delete ANY other user's profile by
 *       supplying their sequential ID in the URL.
 *       CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 *       CWE-862 (Missing Authorization) | A01:2025
 *
 * VULN (v0.2.3): GET /users returns every user to any authenticated user
 *       — no pagination, no limit. Full user table dump. GET /users/:id
 *       with sequential IDs gives 200/404 existence probing (CWE-203).
 *       CWE-200 (Exposure of Sensitive Information) | A01:2025
 *       CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *       CWE-203 (Observable Discrepancy) | A01:2025
 */
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const ok = await this.usersService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
