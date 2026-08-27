/**
 * Ops domain — Cycle-7 Ops Documents (LFI plant on `v1.4.0`).
 */
import { Module } from '@nestjs/common';
import { OpsController } from './ops.controller';
import { OpsService } from './ops.service';

@Module({
  controllers: [OpsController],
  providers: [OpsService],
})
export class OpsModule {}
