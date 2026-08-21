import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../jwt-payload.interface';

/**
 * HasRole Guard — Authorization by database role (v2.0.0)
 *
 * Loads the caller's role from the database using JWT `sub`, then compares
 * to `@HasRole(...)` metadata. The JWT `role` claim is not authoritative.
 */
@Injectable()
export class HasRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload & { sub: string };

    if (user?.sub) {
      const dbUser = await this.userRepo.findOne({ where: { id: user.sub } });
      if (!dbUser) {
        throw new ForbiddenException('Insufficient permissions');
      }
      request.user = { ...user, role: dbUser.role };
    }

    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const effective = request.user as JwtPayload & { sub: string };
    if (!effective?.role || !requiredRoles.includes(effective.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

export const HasRole = (roles: string | string[]) =>
  SetMetadata('roles', Array.isArray(roles) ? roles : [roles]);
