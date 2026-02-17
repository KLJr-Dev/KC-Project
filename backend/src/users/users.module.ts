import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Users module. Registers /users/* routes and service backed by PostgreSQL.
 * TypeOrmModule.forFeature() registers the User entity repository so it
 * can be injected into UsersService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
