import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from './jwt-payload.interface';

/**
 * v0.1.3 — Session Concept
 *
 * Custom parameter decorator that extracts the authenticated user's JWT
 * payload from the request object. Used in controller methods like:
 *
 *   @Get('me')
 *   @UseGuards(JwtAuthGuard)
 *   getMe(@CurrentUser() user: JwtPayload) { ... }
 *
 * --- NestJS convention: createParamDecorator ---
 * NestJS provides createParamDecorator() as the mechanism for custom
 * parameter decorators. The factory function receives:
 *   - data: any argument passed to the decorator (e.g. @CurrentUser('sub'))
 *           We don't use this — _data is unused.
 *   - ctx:  ExecutionContext, same as in guards/interceptors, gives access
 *           to the underlying HTTP request.
 *
 * The decorator reads request.user, which was set by JwtAuthGuard during
 * its canActivate() call. This creates a coupling: @CurrentUser only works
 * when JwtAuthGuard (or something that sets request.user) runs first.
 * If used without a guard, request.user will be undefined.
 *
 * --- Why this exists ---
 * Without this decorator, the controller would need to manually access
 * the request object:
 *
 *   @Get('me')
 *   getMe(@Req() req: Request) {
 *     const user = req.user as JwtPayload;
 *     ...
 *   }
 *
 * @CurrentUser() is cleaner, type-safe, and follows NestJS idioms. It
 * also centralises the cast in one place — if the payload shape changes,
 * only this file needs updating.
 *
 * --- Trust assumption ---
 * This decorator trusts that JwtAuthGuard has already validated the token
 * and set request.user to a valid JwtPayload. There is no runtime type
 * validation here — it's a cast, not a parse. If request.user is set to
 * something unexpected (e.g. by broken middleware), this will silently
 * return the wrong shape. This is acceptable in v0.1.x because the guard
 * and decorator are tightly coupled within the same module.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtPayload;
  },
);
