import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  /**
   * v0.0.5 — Reachability endpoint
   *
   * Infrastructure-only endpoint.
   * Not part of application domain.
   * Will be removed or disabled post v0.1.x.
   */
  @Get('ping')
  ping() {
    return {
      status: 'ok',
      service: 'backend',
    };
  }

  /**
   * GET /admin/crash-test — Intentional error for error handling testing
   *
   * Throws an error to test that errors are properly caught and don't leak
   * sensitive information. Used in e2e tests to verify error handling.
   *
   * Guarded by: JwtAuthGuard only (any authenticated user can access for testing)
   * Tests: v0.2.4 error leakage vulnerability testing (CWE-209)
   */
  @Get('admin/crash-test')
  @UseGuards(JwtAuthGuard)
  crashTest() {
    // INTENTIONAL: Throw an error to test error handling middleware
    throw new Error('Intentional crash test error');
  }
}
