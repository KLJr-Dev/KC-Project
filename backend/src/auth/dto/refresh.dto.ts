/**
 * M6 / v2.0.0 — RefreshDto (POST /auth/refresh).
 *
 * Body `refreshToken` is optional: browsers rely on the httpOnly cookie.
 * API/e2e clients may still send the body value (cookie takes precedence
 * when both are present). CSRF header is still required (see csrf.util).
 */
import { IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsOptional()
  @IsString({ message: 'refreshToken must be a string' })
  refreshToken?: string;
}
