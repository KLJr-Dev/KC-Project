/**
 * Defense Ops alerts — persist + ack (admin-only consumers).
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  AlertSeverity,
  SecurityAlert,
} from './entities/security-alert.entity';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(SecurityAlert)
    private readonly alertRepo: Repository<SecurityAlert>,
  ) {}

  async raise(
    severity: AlertSeverity,
    kind: string,
    message: string,
    sourceAction = '',
  ): Promise<SecurityAlert> {
    const entry = this.alertRepo.create({
      id: randomUUID(),
      severity,
      kind,
      message,
      sourceAction,
      acked: false,
      createdAt: new Date().toISOString(),
    });
    await this.alertRepo.insert(entry);
    return entry;
  }

  async findAll(acked?: boolean): Promise<SecurityAlert[]> {
    const where = typeof acked === 'boolean' ? { acked } : {};
    return this.alertRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async ack(id: string): Promise<SecurityAlert> {
    const row = await this.alertRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Alert not found');
    row.acked = true;
    return this.alertRepo.save(row);
  }
}
