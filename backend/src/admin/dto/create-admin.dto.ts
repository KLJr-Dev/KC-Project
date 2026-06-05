/**
 * v0.5.0 — Input Validation Pipeline: CreateAdminDto
 *
 * Request body for POST /admin (admin-only, creates admin entity/label).
 *
 * v0.5.0 adds validators:
 * - label: @IsString (required label/name)
 * - role: @IsEnum (required admin role; typically 'admin')
 */
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateAdminDto {
  @IsString({ message: 'label must be a string' })
  @IsNotEmpty({ message: 'label is required' })
  label!: string;

  @IsEnum(['user', 'moderator', 'admin'], { message: 'role must be one of: user, moderator, admin' })
  @IsNotEmpty({ message: 'role is required' })
  role!: string;
}
