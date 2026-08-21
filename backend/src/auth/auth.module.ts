/**
 * M4/M5 — AuthModule wires JWT + refresh entity + role guard.
 *
 * M5: loadJwtRuntimeConfig() fails closed in production without RS256 PEMs
 * (see jwt-config.ts). Local/e2e may still use HS256 for convenience.
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { HasRoleGuard } from './guards/has-role.guard';
import { JwtAuthGuard } from './jwt-auth.guard';
import { loadJwtRuntimeConfig } from './jwt-config';

const jwtCfg = loadJwtRuntimeConfig();

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([User, RefreshToken]),
    JwtModule.register(
      jwtCfg.algorithm === 'RS256'
        ? {
            privateKey: jwtCfg.privateKey,
            publicKey: jwtCfg.publicKey,
            signOptions: {
              algorithm: 'RS256',
              expiresIn: jwtCfg.expiresIn as `${number}m`,
            },
            verifyOptions: { algorithms: ['RS256'] },
          }
        : {
            secret: jwtCfg.secret,
            signOptions: {
              expiresIn: jwtCfg.expiresIn as `${number}m`,
            },
          },
    ),
  ],
  controllers: [AuthController],
  providers: [AuthService, HasRoleGuard, JwtAuthGuard],
  exports: [JwtModule, HasRoleGuard, JwtAuthGuard, TypeOrmModule],
})
export class AuthModule {}
