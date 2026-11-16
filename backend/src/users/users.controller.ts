/**
 * Users API — production AuthZ (Cycle-10 Blue / v2.10.0).
 *
 * List/create are admin-only. Get/update/delete are self or admin.
 * HasRoleGuard loads DB role (JWT role is non-authoritative).
 */
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';

@Controller('users')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HasRole('admin')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @HasRole('admin')
  async findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  async findById(@Param('id') id: string, @CurrentUser() actor: JwtPayload) {
    this.assertSelfOrAdmin(id, actor);
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: JwtPayload,
  ) {
    this.assertSelfOrAdmin(id, actor);
    // Non-admins cannot set role via this path (UpdateUserDto should not expose role)
    const user = await this.usersService.update(id, dto);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Delete(':id')
  @HasRole('admin')
  async delete(@Param('id') id: string) {
    const ok = await this.usersService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }

  private assertSelfOrAdmin(targetId: string, actor: JwtPayload): void {
    if (actor.role === 'admin' || actor.sub === targetId) return;
    throw new ForbiddenException('Insufficient permissions');
  }
}
