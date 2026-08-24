/**
 * Body for POST /sharing (v2.1.0).
 * Service enforces file ownership before creating a share; tokens are unguessable.
 */
import { IsString, IsBoolean, IsISO8601, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSharingDto {
  @IsString({ message: 'fileId must be a string' })
  @IsNotEmpty({ message: 'fileId is required' })
  fileId!: string;

  @IsBoolean({ message: 'public must be a boolean' })
  @IsOptional()
  public?: boolean;

  @IsISO8601({ strict: true }, { message: 'expiresAt must be a valid ISO 8601 timestamp' })
  @IsOptional()
  expiresAt?: string;
}
