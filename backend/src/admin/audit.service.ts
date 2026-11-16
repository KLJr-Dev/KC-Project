import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { AuditLog } from './entities/audit-log.entity';

/** Drop obvious PII keys from audit detail payloads. */
function redactDetails(details?: Record<string, unknown>): string {
  if (!details) return '';
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(details)) {
    if (/email|password|token|secret|authorization/i.test(k)) {
      out[k] = '[redacted]';
    } else {
      out[k] = v;
    }
  }
  return JSON.stringify(out);
}

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
    const entry = this.auditRepo.create({
      id: randomUUID(),
      actorId,
      action,
      targetId: targetId ?? '',
      details: redactDetails(details),
      createdAt: new Date().toISOString(),
    });
    await this.auditRepo.save(entry);
  }

  async findAll(): Promise<AuditLog[]> {
    return this.auditRepo.find({ order: { createdAt: 'DESC' } });
  }
}
