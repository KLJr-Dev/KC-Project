/**
 * v0.5.0 — Input Validation Pipeline: UpdateSharingDto
 *
 * Request body for PUT /sharing/:id (updates share settings).
 *
 * v0.5.0 adds validators:
 * - public: @IsBoolean, @IsOptional (share visibility toggle)
 * - expiresAt: @IsISO8601, @IsOptional (update expiry time)
 *
 * All fields optional; clients send only what they want to update.
 *
 * VULN (Intentional):
 *   - CWE-639 (IDOR): No ownership check; users can update shares they don't own
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
