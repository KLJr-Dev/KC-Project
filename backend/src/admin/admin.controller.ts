import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRoleGuard, HasRole } from '../auth/guards/has-role.guard';
import { GetAdminUsersResponseDto } from './dto/get-admin-users-response.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { CurrentUser } from '../auth/current-user.decorator';

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
  async getAllUsers(): Promise<GetAdminUsersResponseDto> {
    // VULN: HasRoleGuard trusts JWT role, doesn't re-check database
    return this.adminService.getAllUsers();
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
  ) {
    // VULN: No additional authorization checks beyond "is admin"
    // VULN: Admin can modify any user, including other admins
    // VULN: No rate limiting on role changes
    return this.adminService.updateUserRole(userId, dto.role);
  }

  /**
   * PUT /admin/users/:id/role/escalate — Escalate user role (moderator can promote)
   *
   * Guarded by: JwtAuthGuard + HasRoleGuard (requires 'moderator' or 'admin')
   * CWE-269: Privilege Escalation via Role Delegation
   * CWE-639: Role trust from JWT, multiplied by cascade effect
   * CWE-841: Unclear role hierarchy (moderator at same nominal level but can promote)
   *
   * Design Flaw: 
   * - Moderator can promote user → moderator
   * - New moderator can immediately promote another → moderator
   * - Exponential escalation possible (A→B→C→D cascade)
   */
  @Put('users/:id/role/escalate')
  @HasRole(['moderator', 'admin'])
  @ApiOperation({
    summary: 'Escalate user role (moderator or admin)',
    description:
      'Promote a user to moderator role if not already. Only moderators and admins can call this. CWE-269 enabled: moderator can create more moderators immediately.',
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
    description: 'Forbidden (not moderator or admin)',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async escalateUserRole(
    @Param('id') userId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    // CWE-639: Role extracted from JWT, no DB re-validation
    return this.adminService.escalateUserRole(userId, user.role as 'user' | 'moderator' | 'admin');
  }

  /**
   * GET /admin/audit-logs — Retrieve audit logs (placeholder for v0.4.4)
   *
   * Guarded by: JwtAuthGuard + HasRoleGuard (requires 'admin' role)
   * CWE-532: No persistent audit trail yet
   */
  @Get('audit-logs')
  @HasRole('admin')
  @ApiOperation({
    summary: 'Get audit logs (admin only, placeholder)',
    description:
      'Returns array of audit log entries. Currently a placeholder returning empty array (CWE-532: No audit trail implemented).',
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
}

