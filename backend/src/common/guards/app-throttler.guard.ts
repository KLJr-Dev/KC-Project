/**
 * M8 / v2.0.0 — Throttler guard that trusts X-Forwarded-For behind nginx.
 *
 * Security: rate limits must key on the real client IP, not the docker bridge
 * peer (otherwise every user shares one bucket). nginx sets X-Forwarded-For.
 */
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, unknown>): Promise<string> {
    const headers = req.headers as Record<string, string | string[] | undefined> | undefined;
    const xff = headers?.['x-forwarded-for'];
    if (typeof xff === 'string' && xff.length > 0) {
      return xff.split(',')[0].trim();
    }
    if (Array.isArray(xff) && xff[0]) {
      return String(xff[0]).split(',')[0].trim();
    }
    const ip = req.ip;
    if (typeof ip === 'string' && ip) return ip;
    return 'unknown';
  }
}
