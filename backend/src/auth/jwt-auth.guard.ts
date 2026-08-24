import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * JWT Bearer authentication guard (secure parallel v2.1.0).
 *
 * Verifies the access token via JwtService (RS256 in prod; see jwt-config).
 * Attaches decoded payload to request.user. Authorization (DB role) is
 * HasRoleGuard’s job — JWT `role` claim is non-authoritative.
 *
 * Historical (v1.0.0): HS256 `kc-secret`, no exp/revocation, localStorage-only
 * logout — see Cycle-1 writeup. Current: short-lived access JWT + httpOnly
 * refresh rows; logout revokes refresh.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Determines whether the current request is allowed to proceed.
   *
   * @param context  NestJS execution context — provides access to the
   *                 underlying HTTP request via switchToHttp().getRequest()
   * @returns        true if the token is valid; throws UnauthorizedException otherwise
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Unauthorized');
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const token = authHeader.slice(7);

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);
      (request as Request & { user: JwtPayload }).user = payload;
    } catch {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
