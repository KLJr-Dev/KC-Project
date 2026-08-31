/**
 * Cycle-9 SoftDev — Intake BFF module (Platform → Onboarding squad FastAPI).
 */
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { IntakeBffController } from './intake-bff.controller';
import { IntakeBffService } from './intake-bff.service';

@Module({
  imports: [AuthModule],
  controllers: [IntakeBffController],
  providers: [IntakeBffService],
})
export class IntakeBffModule {}
