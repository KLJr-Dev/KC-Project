/**
 * Cycle-10 — Stage-0 public access request (`POST /access-requests`).
 *
 * CYCLE10-PLANT: unauthenticated endpoint discovers via HTML comment →
 * hidden frontend form. Creates **moderator** account only (never admin).
 * Open `/auth/register` remains noise (role=user → packets 403).
 *
 * No JwtAuthGuard by design (anonymous Stage 0).
 */
import { Body, Controller, Post } from '@nestjs/common';
import { AccessRequestsService } from './access-requests.service';
import { AccessRequestDto } from './dto/access-request.dto';

@Controller('access-requests')
export class AccessRequestsController {
  constructor(private readonly access: AccessRequestsService) {}

  @Post()
  submit(@Body() dto: AccessRequestDto) {
    return this.access.submit(dto);
  }
}
