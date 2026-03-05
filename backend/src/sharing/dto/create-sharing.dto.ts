/**
 * v0.5.0 — Input Validation Pipeline: CreateSharingDto
 *
 * Request body for POST /sharing (creates public share link for file).
 *
 * v0.5.0 adds validators:
 * - fileId: @IsUUID (UUID format validation; tracks which file to share)
 * - public: @IsBoolean, @IsOptional (defaults false if omitted)
 * - expiresAt: @IsISO8601, @IsOptional (ISO timestamp for share expiry)
 *
 * VULN (Intentional):
 *   - CWE-639 (IDOR): No ownership validation; users can share files they don't own
 *   - CWE-330 (Predictable Tokens): v0.3.x uses sequential tokens (not UUID-based)
 */
import { IsUUID, IsBoolean, IsISO8601, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSharingDto {
  @IsUUID('4', { message: 'fileId must be a valid UUID' })
  @IsNotEmpty({ message: 'fileId is required' })
  fileId!: string;

  @IsBoolean({ message: 'public must be a boolean' })
  @IsOptional()
  public?: boolean;

  @IsISO8601({ strict: true }, { message: 'expiresAt must be a valid ISO 8601 timestamp' })
  @IsOptional()
  expiresAt?: string;
}
