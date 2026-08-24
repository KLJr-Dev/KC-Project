import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { SharingEntity } from './entities/sharing.entity';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';

/**
 * Sharing module — /sharing routes (v2.1.0).
 * Public token download remains intentional product surface; tokens unguessable;
 * mutate requires owner/admin.
 */
@Module({
  imports: [TypeOrmModule.forFeature([SharingEntity]), AuthModule, FilesModule],
  controllers: [SharingController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
