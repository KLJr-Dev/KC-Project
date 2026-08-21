import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRoleGuard, HasRole } from '../auth/guards/has-role.guard';
import { GetAdminUsersResponseDto } from './dto/get-admin-users-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';
import { AdminUsersQueryDto } from './dto/admin-users-query.dto';
import { AdminStatsResponseDto } from './dto/admin-stats-response.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /admin/users — List all users with details
   *
   * Guarded by: JwtAuthGuard + HasRoleGuard (requires 'admin' role from metadata)
   * CWE-639: Role trust from JWT, no DB re-validation
   * CWE-400: Unbounded list dump, no pagination
   * CWE-200: All user emails and roles exposed
   */
  @Get('users')
  @HasRole('admin')
  @ApiOperation({
    summary: 'List all users (admin only)',
    description:
      'Returns all users with their details. Guarded by HasRole(admin), trusts JWT role (CWE-639).',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all users',
    type: GetAdminUsersResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (no token)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  async getAllUsers(@Query() query: AdminUsersQueryDto): Promise<GetAdminUsersResponseDto> {
    // VULN: HasRoleGuard trusts JWT role, doesn't re-check database
    return this.adminService.getAllUsers(query);
  }

  /**
   * PUT /admin/users/:id/role — Update a user's role
   *
   * Guarded by: JwtAuthGuard + HasRoleGuard (requires 'admin' role from metadata)
   * CWE-639: Role trust from JWT
   * CWE-862: No additional checks on which user can be modified
   * CWE-532: No audit trail (logged to stdout, lost on restart)
   */
  @Put('users/:id/role')
  @HasRole('admin')
  @ApiOperation({
    summary: 'Update a user role (admin only)',
    description:
      'Change any user role from "user" to "admin" (or vice versa). No audit trail. Changes take effect immediately (CWE-862, CWE-532).',
  })
  @ApiResponse({
    status: 200,
    description: 'User role updated',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.adminService.updateUserRole(userId, dto.role, user.sub);
  }

  /**
   * PUT /admin/users/:id/role/escalate — Promote user → moderator (admin only).
   */
  @Put('users/:id/role/escalate')
  @HasRole('admin')
  @ApiOperation({
    summary: 'Escalate user role (admin only)',
    description: 'Promote a user to moderator. Admin-only (v2.0.0).',
  })
  @ApiResponse({
    status: 200,
    description: 'User escalated to moderator',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async escalateUserRole(@Param('id') userId: string, @CurrentUser() user: JwtPayload) {
    return this.adminService.escalateUserRole(
      userId,
      user.role as 'user' | 'moderator' | 'admin',
      user.sub,
    );
  }

  /**
   * GET /admin/stats — System statistics (v0.6.2)
   */
  @Get('stats')
  @HasRole('admin')
  @ApiOperation({ summary: 'System statistics (admin only)' })
  async getStats(
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<AdminStatsResponseDto> {
    return this.adminService.getStats(from, to);
  }

  /**
   * GET /admin/audit-logs — Persistent audit trail (admin only).
   */
  @Get('audit-logs')
  @HasRole('admin')
  @ApiOperation({
    summary: 'Get audit logs (admin only)',
    description: 'Returns persisted audit log entries. Requires admin role.',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log entries',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  async getAuditLogs() {
    return this.adminService.getAuditLogs();
  }

  /**
   * DELETE /admin/users/:id — Delete a user (admin only).
   */
  @Delete('users/:id')
  @HasRole('admin')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Delete a user (admin only)',
    description: 'Delete a user by ID. Requires admin role.',
  })
  @ApiResponse({
    status: 204,
    description: 'User deleted successfully (no body returned)',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized (no token)',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden (not admin)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(@Param('id') userId: string, @CurrentUser() user: JwtPayload): Promise<void> {
    return this.adminService.deleteUser(userId, user.sub);
  }
}
