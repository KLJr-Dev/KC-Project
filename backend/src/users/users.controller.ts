import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

/**
 * v0.1.0 — User Model Introduced
 *
 * Users controller. RESTful resource at /users. Thin HTTP layer that
 * delegates to UsersService. Controller routes unchanged from v0.0.6;
 * the service now uses User entities internally and maps to DTOs.
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    const user = this.usersService.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = this.usersService.update(id, dto);
    if (!user) throw new NotFoundException();
    return user;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.usersService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
