import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Users controller. RESTful resource at /users. Thin HTTP layer that
 * delegates to UsersService. All handlers are now async because the
 * service hits PostgreSQL via TypeORM.
 */
@Controller('users')
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
