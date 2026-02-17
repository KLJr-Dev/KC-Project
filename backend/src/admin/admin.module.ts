import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminItem } from './entities/admin-item.entity';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Admin module. Registers /admin/* routes and service backed by PostgreSQL.
 * TypeOrmModule.forFeature() registers the AdminItem repository so it
 * can be injected into AdminService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([AdminItem])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
