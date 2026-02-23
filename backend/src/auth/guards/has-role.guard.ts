import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayload } from '../jwt-payload.interface';

/**
 * HasRole Guard — Authorization by Role Claim
 *
 * Trusts the `role` claim in the JWT payload without re-validating against the database.
 * This is an intentional security weakness (CWE-639: Client-Controlled Authorization).
 *
 * Usage:
 *   @SetMetadata('roles', ['admin'])
 *   @UseGuards(HasRoleGuard)
 *   async handler() { ... }
 *
 * Or use the @HasRole decorator:
 *   @HasRole('admin')
 *   async handler() { ... }
 *
 * CWE-639: The role claim is trusted as-is from the JWT. If an attacker can forge a JWT
 * (e.g., by knowing the hardcoded secret 'kc-secret' from v0.1.3), they can add any role
 * claim and this guard will accept it. The guard does NOT re-check the database.
 */
@Injectable()
export class HasRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    
    if (!requiredRoles || requiredRoles.length === 0) {
      // No roles required, allow access
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload & { sub: string };

    if (!user || !user.role) {
      throw new ForbiddenException('No role found in token (CWE-639)');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Insufficient permissions. Required role(s): ${requiredRoles.join(
          ', ',
        )}, but user has role: ${user.role} (CWE-862)`,
      );
    }

    return true;
  }
}

/**
 * Decorator: Mark a handler as requiring specific roles
 * Usage: @HasRole('admin') or @HasRole(['admin', 'moderator'])
 */
import { SetMetadata } from '@nestjs/common';

export const HasRole = (roles: string | string[]) =>
  SetMetadata('roles', Array.isArray(roles) ? roles : [roles]);
