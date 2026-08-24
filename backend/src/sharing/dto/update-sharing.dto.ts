/**
 * Body for PUT /sharing/:id (v2.1.0).
 * Service enforces owner or admin before update.
 */
import { IsBoolean, IsISO8601, IsOptional } from 'class-validator';

export class UpdateSharingDto {
  @IsBoolean({ message: 'public must be a boolean' })
  @IsOptional()
  public?: boolean;

  @IsISO8601({ strict: true }, { message: 'expiresAt must be a valid ISO 8601 timestamp' })
  @IsOptional()
  expiresAt?: string;
}
