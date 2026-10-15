/**
 * Cycle-9 Blue — Nest Intake BFF (`/intake/*` behind nginx `/api`).
 *
 * Thin proxy only — no onboarding business logic (FastAPI is SoT).
 * Hop identity is taken from the verified JWT only (never client X-User-*).
 */
import {
  All,
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { IntakeBffService } from './intake-bff.service';

@Controller('intake')
@UseGuards(JwtAuthGuard)
export class IntakeBffController {
  constructor(private readonly intakeBff: IntakeBffService) {}

  @Get('search')
  async search(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Query('q') q: string | undefined,
  ): Promise<void> {
    const qs = q !== undefined ? `search?q=${encodeURIComponent(q)}` : 'search';
    await this.proxyTo(req, res, user, qs);
  }

  @All('onboarding-requests')
  async onboardingRequestsRoot(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.proxyTo(req, res, user, 'onboarding-requests');
  }

  @All('onboarding-requests/:id')
  async onboardingRequestById(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, `onboarding-requests/${id}`);
  }

  @All('onboarding-requests/:id/status')
  async onboardingRequestStatus(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, `onboarding-requests/${id}/status`);
  }

  @Get('onboarding-requests/:id/export')
  async onboardingRequestExport(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('file') file: string | undefined,
  ): Promise<void> {
    const qs =
      file !== undefined
        ? `onboarding-requests/${id}/export?file=${encodeURIComponent(file)}`
        : `onboarding-requests/${id}/export`;
    await this.proxyTo(req, res, user, qs);
  }

  @Get('security/events')
  async securityEvents(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.proxyTo(req, res, user, 'security/events');
  }

  @Get('security/metrics')
  async securityMetrics(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.proxyTo(req, res, user, 'security/metrics');
  }

  @Get('v1/internal/debug')
  async honeypot(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.proxyTo(req, res, user, 'v1/internal/debug');
  }

  private async proxyTo(
    req: Request,
    res: Response,
    user: JwtPayload,
    pathAndQuery: string,
  ): Promise<void> {
    // Blue: never forward client X-User-*; plant identity from verified JWT only.
    // Also forward Authorization so Intake can independently verify RS256.
    const authHeader = req.headers.authorization;
    const authorization =
      typeof authHeader === 'string' && authHeader.trim() !== ''
        ? authHeader.trim()
        : undefined;

    const { body, contentType } = this.encodeBody(req);
    const upstream = await this.intakeBff.forward(
      req.method,
      pathAndQuery,
      {
        userId: user.sub,
        userRole: user.role || 'user',
        authorization,
      },
      body,
      contentType,
    );

    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    res.status(upstream.status).send(upstream.body);
  }

  private encodeBody(req: Request): {
    body: Buffer | undefined;
    contentType: string | undefined;
  } {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
      return { body: undefined, contentType: undefined };
    }
    const ct = req.headers['content-type'];
    const contentType = typeof ct === 'string' ? ct : undefined;
    if (req.body === undefined || req.body === null) {
      return { body: undefined, contentType };
    }
    if (Buffer.isBuffer(req.body)) {
      return { body: req.body, contentType };
    }
    if (typeof req.body === 'string') {
      return { body: Buffer.from(req.body, 'utf8'), contentType };
    }
    return {
      body: Buffer.from(JSON.stringify(req.body), 'utf8'),
      contentType: contentType || 'application/json',
    };
  }
}
