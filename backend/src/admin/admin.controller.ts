import {
  Body,
  Controller,
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
}

