/**
 * Cycle-9 SoftDev — Nest Intake BFF (`/intake/*` behind nginx `/api`).
 *
 * Thin proxy only — no onboarding business logic (FastAPI is SoT).
 * Explicit paths match the Cycle-9 OpenAPI stub (Nest 11 splat wildcards
 * did not register reliably for multi-segment proxying).
 */
import {
  All,
  Controller,
  Get,
  Headers,
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
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    const qs = q !== undefined ? `search?q=${encodeURIComponent(q)}` : 'search';
    await this.proxyTo(req, res, user, xUserId, xUserRole, qs);
  }

  @All('onboarding-requests')
  async onboardingRequestsRoot(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, xUserId, xUserRole, 'onboarding-requests');
  }

  @All('onboarding-requests/:id')
  async onboardingRequestById(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, xUserId, xUserRole, `onboarding-requests/${id}`);
  }

  @All('onboarding-requests/:id/status')
  async onboardingRequestStatus(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(
      req,
      res,
      user,
      xUserId,
      xUserRole,
      `onboarding-requests/${id}/status`,
    );
  }

  @Get('onboarding-requests/:id/export')
  async onboardingRequestExport(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Query('file') file: string | undefined,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    const qs =
      file !== undefined
        ? `onboarding-requests/${id}/export?file=${encodeURIComponent(file)}`
        : `onboarding-requests/${id}/export`;
    await this.proxyTo(req, res, user, xUserId, xUserRole, qs);
  }

  @Get('security/events')
  async securityEvents(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, xUserId, xUserRole, 'security/events');
  }

  @Get('security/metrics')
  async securityMetrics(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, xUserId, xUserRole, 'security/metrics');
  }

  @Get('v1/internal/debug')
  async honeypot(
    @Req() req: Request,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
    @Headers('x-user-id') xUserId?: string,
    @Headers('x-user-role') xUserRole?: string,
  ): Promise<void> {
    await this.proxyTo(req, res, user, xUserId, xUserRole, 'v1/internal/debug');
  }

  private async proxyTo(
    req: Request,
    res: Response,
    user: JwtPayload,
    xUserId: string | undefined,
    xUserRole: string | undefined,
    pathAndQuery: string,
  ): Promise<void> {
    // CYCLE9-PLANT: trust client hop headers when present; else fill from JWT.
    // HasRoleGuard is intentionally NOT applied here — Nest-native routes still
    // reload role from DB; this BFF hop is the weak microservice boundary.
    const userId =
      typeof xUserId === 'string' && xUserId.trim() !== ''
        ? xUserId.trim()
        : user.sub;
    const userRole =
      typeof xUserRole === 'string' && xUserRole.trim() !== ''
        ? xUserRole.trim()
        : user.role || 'user';

    const { body, contentType } = this.encodeBody(req);
    const upstream = await this.intakeBff.forward(
      req.method,
      pathAndQuery,
      { userId, userRole },
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
