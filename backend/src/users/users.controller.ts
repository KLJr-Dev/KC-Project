import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Users controller. RESTful resource at /users. All handlers return
 * mock/placeholder data. No persistence, no auth. This version freezes API
 * shape only.
 *
 * --- NestJS convention: Controller = thin HTTP layer ---
 * @Controller('users') mounts all routes under /users. HTTP verb determines
 * the action (POST = create, GET = read, PUT = update, DELETE = delete).
 * Constructor injection of UsersService; 404 on missing id for
 * get/update/delete.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /** v0.0.6 — POST /users. Body parsed into CreateUserDto. */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  /** v0.0.6 — GET /users. */
  @Get()
  read() {
    return this.usersService.read();
  }

  /** v0.0.6 — GET /users/:id. 404 if id not in mock list. */
  @Get(':id')
  getById(@Param('id') id: string) {
    const user = this.usersService.getById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  /** v0.0.6 — PUT /users/:id. 404 if id not found. */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = this.usersService.update(id, dto);
    if (!user) throw new NotFoundException();
    return user;
  }

  /** v0.0.6 — DELETE /users/:id. 404 if id not found. */
  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.usersService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
