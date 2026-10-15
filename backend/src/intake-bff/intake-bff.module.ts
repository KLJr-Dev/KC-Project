/**
 * Cycle-9 Blue — Intake BFF module (Platform → Onboarding squad FastAPI).
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { IntakeBffController } from './intake-bff.controller';
import { IntakeBffService } from './intake-bff.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  controllers: [IntakeBffController],
  providers: [IntakeBffService],
})
export class IntakeBffModule {}
