import { Controller, Get } from '@nestjs/common';

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
}