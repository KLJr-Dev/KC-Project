import { IsNumberString, IsOptional, IsString } from 'class-validator';

/**
 * v0.5.2 — Pagination query params (skip/take).
 * Cycle-3 CTF: optional `q` (ignored unless CTF_MODE enables unsafe search).
 * CWE-400: No rate limiting on paginated requests.
 * CWE-205: Offset-based pagination enables existence oracles.
 */
export class PaginationQueryDto {
  @IsOptional()
  @IsNumberString({}, { message: 'skip must be a number' })
  skip?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'take must be a number' })
  take?: string;

  /** Files search (CTF_MODE: intentional SQLi). Secure path ignores. */
  @IsOptional()
  @IsString()
  q?: string;
}
