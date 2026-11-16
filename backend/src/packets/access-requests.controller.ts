/**
 * Public Document Ops access request (`POST /access-requests`).
 *
 * Unauthenticated by design for SoftEng onboarding UX — creates a *pending*
 * ticket only. Role elevation is admin-only (see AdminAccessRequestsController).
 */
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AccessRequestsService } from './access-requests.service';
import { AccessRequestDto } from './dto/access-request.dto';

@Controller('access-requests')
export class AccessRequestsController {
  constructor(private readonly access: AccessRequestsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  submit(@Body() dto: AccessRequestDto) {
    return this.access.submit(dto);
  }
}
