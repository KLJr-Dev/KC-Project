/**
 * M8 / v2.0.0 — Request logging interceptor.
 *
 * Security measures:
 * - Logs method/path/status/duration/userId only (no bodies — CWE-532).
 * - Query strings with token-like params are stripped from path before log.
 */
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

function sanitizePath(url: string): string {
  const q = url.indexOf('?');
  if (q < 0) return url;
  const path = url.slice(0, q);
  const params = new URLSearchParams(url.slice(q + 1));
  for (const key of [...params.keys()]) {
    if (/token|password|secret|auth/i.test(key)) {
      params.set(key, '[REDACTED]');
    }
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      user?: { sub?: string };
    }>();
    const start = Date.now();

    return next.handle().pipe(
      finalize(() => {
        const res = context.switchToHttp().getResponse<{ statusCode: number }>();
        const entry = {
          event: 'http',
          method: req.method,
          path: sanitizePath(req.url),
          status: res.statusCode,
          durationMs: Date.now() - start,
          userId: req.user?.sub ?? null,
          timestamp: new Date().toISOString(),
        };
        console.log(JSON.stringify(entry));
      }),
    );
  }
}
