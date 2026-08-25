/**
 * PUT /notes/:id body — owner-only update.
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateNoteDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @MaxLength(200, { message: 'title must be at most 200 characters' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'body must be a string' })
  @MaxLength(100_000, { message: 'body must be at most 100000 characters' })
  body?: string;
}
