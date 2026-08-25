import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NoteEntity } from './entities/note.entity';
import { AuthModule } from '../auth/auth.module';

/**
 * Notes module — /notes routes for Cycle-4 SoftDev.
 * Intentionally separate from Files; XSS is a frontend render concern on v1.2.0.
 */
@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity]), AuthModule],
  controllers: [NotesController],
  providers: [NotesService],
  exports: [NotesService],
})
export class NotesModule {}
