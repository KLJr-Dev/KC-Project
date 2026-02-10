import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Auth controller. Route paths defined; handlers return mock/placeholder
 * data. No persistence, no real auth, no frontend dependency.
 *
 * --- NestJS convention: Controller = thin HTTP layer ---
 * Only two routes: register and login. Both POST; body bound to DTOs via
 * @Body(). Constructor injection of AuthService same as admin.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** v0.0.6 — POST /auth/register. Body parsed into RegisterDto. */
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /** v0.0.6 — POST /auth/login. Body parsed into LoginDto. */
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
