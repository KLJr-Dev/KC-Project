/**
 * Cycle-9 Blue — Nest Intake BFF (`/intake/*` behind nginx `/api`).
 *
 * Thin proxy only — no onboarding business logic (FastAPI is SoT).
 * Hop identity: JWT AuthN + role reloaded from DB (never client X-User-*).
 */
import {
  All,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { User } from '../users/entities/user.entity';
import { IntakeBffService } from './intake-bff.service';

@Controller('intake')
@UseGuards(JwtAuthGuard)
export class IntakeBffController {
  constructor(
    private readonly intakeBff: IntakeBffService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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

  /** Secure tip: honeypot removed (C9-F06). */
  @Get('v1/internal/debug')
  honeypotGone(): never {
    throw new NotFoundException();
  }

  private async proxyTo(
    req: Request,
    res: Response,
    user: JwtPayload,
    pathAndQuery: string,
  ): Promise<void> {
    const dbUser = await this.userRepo.findOne({ where: { id: user.sub } });
    if (!dbUser) {
      throw new ForbiddenException('Insufficient permissions');
    }

    const authHeader = req.headers.authorization;
    const authorization =
      typeof authHeader === 'string' && authHeader.trim() !== ''
        ? authHeader.trim()
        : undefined;

    const requestIdHeader = req.headers['x-request-id'];
    const requestId =
      typeof requestIdHeader === 'string' && requestIdHeader.trim() !== ''
        ? requestIdHeader.trim()
        : undefined;

    const { body, contentType } = this.encodeBody(req);
    const upstream = await this.intakeBff.forward(
      req.method,
      pathAndQuery,
      {
        userId: user.sub,
        userRole: dbUser.role || 'user',
        authorization,
        requestId,
      },
      body,
      contentType,
    );

    if (upstream.contentType) {
      res.setHeader('Content-Type', upstream.contentType);
    }
    if (requestId) {
      res.setHeader('X-Request-Id', requestId);
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
