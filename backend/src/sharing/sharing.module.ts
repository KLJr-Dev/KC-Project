import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { SharingEntity } from './entities/sharing.entity';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';

/**
 * v0.3.4 -- Public File Sharing
 *
 * Sharing module. Registers /sharing/* routes and service backed by PostgreSQL.
 * FilesModule imported so the public endpoint can stream files.
 *
 * VULN (v0.2.2): ownerId never checked. CWE-639 | A01:2025
 * VULN (v0.3.4): unauthenticated GET /sharing/public/:token. CWE-285 | A01:2025
 */
@Module({
  imports: [TypeOrmModule.forFeature([SharingEntity]), AuthModule, FilesModule],
  controllers: [SharingController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
