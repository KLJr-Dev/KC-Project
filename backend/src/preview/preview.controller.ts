import { Body, Controller, Get, Header, Post, UseGuards } from '@nestjs/common';
import { PreviewService } from './preview.service';
import { PreviewDto } from './dto/preview.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CYCLE6_FLAG_F1_SSRF } from './cycle6-plants';

/**
 * Link Preview + internal SSRF prize (Cycle-6 / v1.3.0).
 *
 * POST /preview — authenticated open fetch (SSRF teaching surface).
 * GET /internal/cycle6-flag — loopback prize for SSRF (also reachable directly; graded path is via preview).
 */
@Controller()
export class PreviewController {
  constructor(private readonly previewService: PreviewService) {}

  @Post('preview')
  @UseGuards(JwtAuthGuard)
  async preview(@Body() dto: PreviewDto) {
    return this.previewService.preview(dto);
  }

  @Get('internal/cycle6-flag')
  @Header('Content-Type', 'text/plain; charset=utf-8')
  internalFlag(): string {
    return `cycle6-ssrf-prize\n${CYCLE6_FLAG_F1_SSRF}\n`;
  }
}
