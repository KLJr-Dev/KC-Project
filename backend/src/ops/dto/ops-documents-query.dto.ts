/**
 * GET /ops/documents query — Cycle-7 Ops Documents viewer.
 */
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class OpsDocumentsQueryDto {
  @IsString({ message: 'path must be a string' })
  @IsNotEmpty({ message: 'path is required' })
  @MaxLength(512, { message: 'path must be at most 512 characters' })
  path!: string;
}
