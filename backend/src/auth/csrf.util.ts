/**
 * M6 / v2.0.0 — CSRF posture for cookie-authenticated auth mutations.
 *
 * Security measures:
 * - CWE-352: Classic HTML form CSRF cannot set custom headers. Requiring
 *   `X-Requested-With: XMLHttpRequest` on refresh (cookie-bearing) requests
 *   pairs with SameSite cookies so cross-site navigations/forms cannot
 *   silently rotate sessions.
 * - Access-token Bearer requests are not cookie-CSRF vectors for refresh;
 *   this guard applies to endpoints that *consume* the refresh cookie.
 *
 * Not a full double-submit CSRF token — lab baseline chooses header + SameSite.
 */
import { ForbiddenException } from '@nestjs/common';
import type { Request } from 'express';

export const CSRF_HEADER = 'x-requested-with';
export const CSRF_HEADER_VALUE = 'XMLHttpRequest';

/**
 * Reject when the CSRF header is missing/wrong.
 * Call on POST /auth/refresh (and optionally logout when cookie-only).
 */
export function assertCsrfHeader(req: Request): void {
  const value = req.headers[CSRF_HEADER];
  const normalized = Array.isArray(value) ? value[0] : value;
  if (normalized !== CSRF_HEADER_VALUE) {
    throw new ForbiddenException('Missing CSRF header');
  }
}
