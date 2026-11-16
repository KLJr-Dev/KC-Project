import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../admin/entities/audit-log.entity';
import { AuditService } from '../admin/audit.service';
import { SecurityAlert } from '../admin/entities/security-alert.entity';
import { AlertsService } from '../admin/alerts.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, SecurityAlert])],
  providers: [AuditService, AlertsService],
  exports: [AuditService, AlertsService],
})
export class AuditModule {}
