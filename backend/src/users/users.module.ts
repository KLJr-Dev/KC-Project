import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Users module. Registers /users/* routes and service backed by PostgreSQL.
 * TypeOrmModule.forFeature() registers the User entity repository.
 * AuthModule imported to provide JwtService for JwtAuthGuard on controller.
 *
 * VULN (v0.2.2): JwtAuthGuard protects all routes (authentication) but no
 *       authorization or ownership checks exist. Any authenticated user can
 *       read, modify, or delete any other user's data.
 *       CWE-862 (Missing Authorization) | A01:2025
 */
@Module({
  imports: [TypeOrmModule.forFeature([User]), forwardRef(() => AuthModule)],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
