import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface';

/**
 * v0.1.5 — Authentication Edge Cases
 *
 * Route guard that protects endpoints by verifying JWT Bearer tokens.
 * Applied via @UseGuards(JwtAuthGuard) on controller methods.
 *
 * --- NestJS request lifecycle context ---
 * Guards execute AFTER middleware but BEFORE interceptors and route handlers.
 * If canActivate() returns false or throws, the request is rejected before
 * the controller method is ever called. This makes guards the right place
 * for authentication checks in NestJS.
 *
 * --- How this guard works ---
 *   1. Extract the Authorization header from the incoming request
 *   2. Validate it starts with "Bearer " and extract the token string
 *   3. Call jwtService.verify(token) which:
 *      - Decodes the base64 payload
 *      - Verifies the HMAC-SHA256 signature against the secret from JwtModule
 *      - Returns the decoded payload ({ sub, iat }) if valid
 *      - Throws if the signature is invalid, the token is malformed, or
 *        (if configured) the token is expired
 *   4. Attach the decoded payload to request.user so downstream code
 *      (controllers, decorators) can access it
 *   5. Return true to allow the request through
 *
 * --- Intentional vulnerabilities ---
 *
 * VULN: Does NOT check that the user still exists in the data store.
 *       If a user is deleted after being issued a JWT, their token remains
 *       valid and passes this guard. The guard only verifies the cryptographic
 *       signature, not whether the subject (sub) maps to a real user.
 *       CWE-613 (Insufficient Session Expiration) | A07:2025
 *       Remediation (v2.0.0): After verify(), query the database to confirm
 *       the user exists and is not banned/deactivated.
 *
 * VULN: No token deny-list or revocation mechanism. Once a JWT is issued,
 *       there is no way to invalidate it server-side. Client-side logout
 *       (clearing localStorage) does not affect the token's validity.
 *       An attacker who has stolen a token can use it indefinitely.
 *       CWE-613 (Insufficient Session Expiration) | A07:2025
 *       Remediation (v2.0.0): Maintain a refresh_tokens table in the database.
 *       On logout, delete the refresh token. Use short-lived access tokens
 *       (15 min) so stolen access tokens expire quickly.
 *
 * VULN: The secret used for verification is the same hardcoded string
 *       ('kc-secret') configured in JwtModule.register(). This is a
 *       symmetric algorithm (HS256), so the signing key and verification
 *       key are identical. Anyone who discovers the secret can both forge
 *       and verify tokens.
 *       CWE-798 (Use of Hard-coded Credentials) | A04:2025
 *       Remediation (v2.0.0): RS256 asymmetric keys. The private key signs
 *       (kept in a secret store), the public key verifies (can be distributed).
 *
 * VULN: No audience (aud) or issuer (iss) claim validation. Any token signed
 *       with the same secret is accepted, regardless of intended audience.
 *       CWE-347 (Improper Verification of Cryptographic Signature) | A04:2025
 *       Remediation (v2.0.0): Set and validate iss and aud claims.
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
