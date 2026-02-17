import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { SharingEntity } from './entities/sharing.entity';

/**
 * v0.2.0 — Database Introduction (Local)
 *
 * Sharing module. Registers /sharing/* routes and service backed by PostgreSQL.
 * TypeOrmModule.forFeature() registers the SharingEntity repository so it
 * can be injected into SharingService.
 */
@Module({
  imports: [TypeOrmModule.forFeature([SharingEntity])],
  controllers: [SharingController],
  providers: [SharingService],
})
export class SharingModule {}
