/**
 * POST /notes body (JSON create — multipart attachment added in P1c).
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateNoteDto {
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(200, { message: 'title must be at most 200 characters' })
  title!: string;

  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body is required' })
  @MaxLength(100_000, { message: 'body must be at most 100000 characters' })
  body!: string;
}
