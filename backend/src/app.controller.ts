import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  /**
   * v0.0.5 – Reachability endpoint
   *
   * This endpoint exists purely to verify that:
   * - the backend is running
   * - HTTP requests can reach it
   * - responses are returned correctly
   *
   * No business logic. No auth. No services.
   */
  @Get('ping')
  ping() {
    return {
      status: 'ok',
      service: 'backend',
    };
  }
}