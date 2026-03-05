/**
 * v0.5.0 — Input Validation Pipeline: UpdateAdminDto
 *
 * Request body for PUT /admin/:id (updates admin metadata).
 * All fields optional (partial shape).
 *
 * v0.5.0 adds validators:
 * - label: @IsString (optional label/name field)
 * - role: @IsEnum (optional role field)
 */
import { IsString, IsEnum, IsOptional } from 'class-validator';

export class UpdateAdminDto {
  @IsString({ message: 'label must be a string' })
  @IsOptional()
  label?: string;

  @IsEnum(['user', 'moderator', 'admin'], { message: 'role must be one of: user, moderator, admin' })
  @IsOptional()
  role?: string;
}
