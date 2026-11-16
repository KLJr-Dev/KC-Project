/**
 * Propagate or mint X-Request-Id for structured logs / tracing.
 */
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    const id =
      incoming && /^[A-Za-z0-9_-]{8,128}$/.test(incoming) ? incoming : randomUUID();
    (req as Request & { requestId?: string }).requestId = id;
    res.setHeader('X-Request-Id', id);
    next();
  }
}
