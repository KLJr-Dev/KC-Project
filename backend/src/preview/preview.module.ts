import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PreviewController } from './preview.controller';
import { PreviewService } from './preview.service';
import { BookmarksController } from './bookmarks.controller';
import { BookmarksService } from './bookmarks.service';
import { LinkBookmarkEntity } from './entities/link-bookmark.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([LinkBookmarkEntity]), AuthModule],
  controllers: [PreviewController, BookmarksController],
  providers: [PreviewService, BookmarksService],
})
export class PreviewModule {}
