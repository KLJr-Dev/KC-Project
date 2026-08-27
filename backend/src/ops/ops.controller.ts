/**
 * Ops Documents HTTP API — Cycle-7 Blue (`v2.4.0`).
 *
 * Routes (behind nginx `/api`):
 * - GET /ops/documents?path= — authenticated document read (path-confined)
 *
 * C7-F01 closed: see OpsService path confinement.
 */
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { OpsDocumentsQueryDto } from './dto/ops-documents-query.dto';
import { OpsService } from './ops.service';

@Controller('ops')
@UseGuards(JwtAuthGuard)
export class OpsController {
  constructor(private readonly opsService: OpsService) {}

  /** GET /ops/documents?path=handbook.txt */
  @Get('documents')
  async documents(@Query() query: OpsDocumentsQueryDto) {
    return this.opsService.readDocument(query.path);
  }
}
