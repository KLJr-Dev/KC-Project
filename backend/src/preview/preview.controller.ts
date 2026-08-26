import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PreviewService } from './preview.service';
import { PreviewDto } from './dto/preview.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * Link Preview — Cycle-6 Blue (`v2.3.0`).
 * POST /preview — authenticated fetch with destination policy + throttle.
 * Internal SSRF prize route removed on secure tip.
 */
@Controller()
export class PreviewController {
  constructor(private readonly previewService: PreviewService) {}

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async preview(@Body() dto: PreviewDto) {
    return this.previewService.preview(dto);
  }
}
