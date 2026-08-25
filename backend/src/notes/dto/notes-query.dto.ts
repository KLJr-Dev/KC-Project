/**
 * GET /notes query — pagination + optional search.
 *
 * IMPORTANT: `q` lives here, NOT on shared PaginationQueryDto.
 * Cycle-3 regression requires GET /files?q= → 400 (forbidNonWhitelisted).
 * Search must stay TypeORM ILike / parameterized — never string-concat SQL.
 */
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class NotesQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString({ message: 'q must be a string' })
  @MaxLength(200, { message: 'q must be at most 200 characters' })
  q?: string;
}
