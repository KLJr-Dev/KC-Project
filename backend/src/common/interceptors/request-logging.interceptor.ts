import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

/**
 * v0.5.4 — Request logging to stdout (CWE-532: no persistence).
 */
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
          path: req.url,
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
