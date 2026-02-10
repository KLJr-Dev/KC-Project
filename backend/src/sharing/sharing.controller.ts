import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { SharingService } from './sharing.service';
import { CreateSharingDto } from './dto/create-sharing.dto';
import { UpdateSharingDto } from './dto/update-sharing.dto';

/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Sharing controller. RESTful resource at /sharing. All handlers return
 * mock/placeholder data. No persistence. This version freezes API shape only.
 * Real public links and sharing logic (v0.3.4) come later.
 *
 * --- NestJS convention: Controller = thin HTTP layer ---
 * @Controller('sharing') mounts all routes under /sharing. HTTP verb
 * determines the action. 404 on missing id for get/update/delete.
 */
@Controller('sharing')
export class SharingController {
  constructor(private readonly sharingService: SharingService) {}

  /** v0.0.6 — POST /sharing. Body parsed into CreateSharingDto. */
  @Post()
  create(@Body() dto: CreateSharingDto) {
    return this.sharingService.create(dto);
  }

  /** v0.0.6 — GET /sharing. */
  @Get()
  read() {
    return this.sharingService.read();
  }

  /** v0.0.6 — GET /sharing/:id. 404 if id not in mock list. */
  @Get(':id')
  getById(@Param('id') id: string) {
    const share = this.sharingService.getById(id);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** v0.0.6 — PUT /sharing/:id. 404 if id not found. */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSharingDto) {
    const share = this.sharingService.update(id, dto);
    if (!share) throw new NotFoundException();
    return share;
  }

  /** v0.0.6 — DELETE /sharing/:id. 404 if id not found. */
  @Delete(':id')
  delete(@Param('id') id: string) {
    const ok = this.sharingService.delete(id);
    if (!ok) throw new NotFoundException();
    return { deleted: id };
  }
}
