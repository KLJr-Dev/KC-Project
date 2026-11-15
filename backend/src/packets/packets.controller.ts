/**
 * Cycle-10 — Packets HTTP API (`GET/POST /packets`).
 *
 * SoftDev B6: JWT + HasRoleGuard (DB role authoritative).
 * Plain `user` → 403 on all routes; Stage-0 access-request elevates to moderator.
 *
 * @see packets-openapi-stub.yaml · cycle-10-decisions.md §C graded path
 */
import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HasRole, HasRoleGuard } from '../auth/guards/has-role.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt-payload.interface';
import { PacketsService } from './packets.service';

@Controller('packets')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class PacketsController {
  constructor(private readonly packets: PacketsService) {}

  /** GET /packets — list caller's packets (moderator|admin). */
  @Get()
  @HasRole(['moderator', 'admin'])
  list(@CurrentUser() user: JwtPayload) {
    return this.packets.listForOwner(user.sub);
  }

  /** GET /packets/:id — packet detail (owner-scoped). */
  @Get(':id')
  @HasRole(['moderator', 'admin'])
  getOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.packets.getById(id, user.sub);
  }

  /**
   * POST /packets — multipart upload → docproc helper plant.
   * Field name: `file` (OpenAPI stub). Memory storage so buffer reaches helper.
   */
  @Post()
  @HasRole(['moderator', 'admin'])
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.packets.upload(file, user.sub);
  }
}
