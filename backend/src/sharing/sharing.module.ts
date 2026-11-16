import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharingController } from './sharing.controller';
import { SharingService } from './sharing.service';
import { SharingEntity } from './entities/sharing.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';
import { FilesModule } from '../files/files.module';

/**
 * Sharing module — public token download; mutate requires owner or DB admin.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([SharingEntity, User]),
    AuthModule,
    FilesModule,
  ],
  controllers: [SharingController],
  providers: [SharingService],
  exports: [SharingService],
})
export class SharingModule {}
