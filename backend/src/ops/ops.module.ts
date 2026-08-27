/**
 * Ops domain — Cycle-7 Ops Documents (path-confined on `v2.4.0`).
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OpsController } from './ops.controller';
import { OpsService } from './ops.service';

@Module({
  imports: [AuthModule],
  controllers: [OpsController],
  providers: [OpsService],
})
export class OpsModule {}
