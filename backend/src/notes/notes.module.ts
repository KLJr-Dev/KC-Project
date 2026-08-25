import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteEntity } from './entities/note.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Notes module — /notes routes (Cycle-4 product; secure tip `v2.2.0`).
 * Separate from Files. Body render is frontend plain text (C4-F01).
 */
@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity]), AuthModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
