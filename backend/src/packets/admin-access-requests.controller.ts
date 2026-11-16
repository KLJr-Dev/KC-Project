/**
 * Admin review of Document Ops access requests (Cycle-10 Blue).
 * DB role via HasRoleGuard is authoritative — JWT role is non-authoritative.
 */
import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import {
  AccessRequestsService,
  type AccessRequestListItem,
} from './access-requests.service';
import type { AccessRequestStatus } from './entities/access-request.entity';

@ApiTags('admin')
@Controller('admin/access-requests')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class AdminAccessRequestsController {
  constructor(private readonly access: AccessRequestsService) {}

  @Get()
  @HasRole('admin')
  @ApiOperation({ summary: 'List Document Ops access requests (admin)' })
  list(
    @Query('status') status?: AccessRequestStatus,
  ): Promise<AccessRequestListItem[]> {
    return this.access.list(status);
  }

  @Post(':id/approve')
  @HasRole('admin')
  @ApiOperation({ summary: 'Approve access request → create moderator user' })
  approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AccessRequestListItem> {
    return this.access.approve(id, user.sub);
  }

  @Post(':id/deny')
  @HasRole('admin')
  @ApiOperation({ summary: 'Deny access request' })
  deny(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<AccessRequestListItem> {
    return this.access.deny(id, user.sub);
  }
}
