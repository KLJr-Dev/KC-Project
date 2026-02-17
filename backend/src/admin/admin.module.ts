import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminItem } from './entities/admin-item.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Admin module. Registers /admin/* routes and service backed by PostgreSQL.
 * AuthModule imported to provide JwtService for JwtAuthGuard on controller.
 *
 * VULN (v0.2.2): Any authenticated user can access admin endpoints.
 *       No role or privilege check exists.
 *       CWE-862 (Missing Authorization) | A01:2021
 */
@Module({
  imports: [TypeOrmModule.forFeature([AdminItem]), AuthModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
