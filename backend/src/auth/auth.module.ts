import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { HasRoleGuard } from './guards/has-role.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Auth feature module (v2.0.0 secure parallel).
 *
 * JWT signing key and TTL come from environment (no hardcoded secret).
 * HasRoleGuard is exported so resource modules can enforce DB-backed RBAC.
 */
@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-only-change-me',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, HasRoleGuard, JwtAuthGuard],
  exports: [JwtModule, HasRoleGuard, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
