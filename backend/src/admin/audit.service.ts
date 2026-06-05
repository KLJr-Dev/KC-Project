import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  async record(
    actorId: string,
    action: string,
    targetId?: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    const count = await this.auditRepo.count();
    const entry = this.auditRepo.create({
      id: String(count + 1),
      actorId,
      action,
      targetId: targetId ?? '',
      details: details ? JSON.stringify(details) : '',
      createdAt: new Date().toISOString(),
    });
    await this.auditRepo.save(entry);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepo.find({ order: { createdAt: 'DESC' } });
  }
}
