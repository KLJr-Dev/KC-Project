/**
 * Document Ops access requests (Cycle-10 Blue / v2.10.0).
 *
 * Public submit creates a pending ticket only — never elevates role (A01).
 * Admin approve creates the User and grants moderator via audited escalate path.
 */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { User } from '../users/entities/user.entity';
import { hashPassword } from '../auth/password.util';
import { AuditService } from '../admin/audit.service';
import { AlertsService } from '../admin/alerts.service';
import { AccessRequestDto } from './dto/access-request.dto';
import {
  AccessRequestEntity,
  AccessRequestStatus,
} from './entities/access-request.entity';

export type AccessRequestPublicResult = {
  message: string;
  email: string;
  status: 'pending';
};

export type AccessRequestListItem = {
  id: string;
  email: string;
  username: string;
  justification: string;
  status: AccessRequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

@Injectable()
export class AccessRequestsService {
  constructor(
    @InjectRepository(AccessRequestEntity)
    private readonly requestRepo: Repository<AccessRequestEntity>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly audit: AuditService,
    private readonly alerts: AlertsService,
  ) {}

  async submit(dto: AccessRequestDto): Promise<AccessRequestPublicResult> {
    const email = (dto.email || '').trim().toLowerCase();
    const username = (dto.username || '').trim();
    const password = dto.password || '';
    if (!email || !username || !password) {
      throw new BadRequestException('email, username, and password required');
    }

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Unable to process access request');
    }

    const pending = await this.requestRepo.findOne({
      where: { email, status: 'pending' },
    });
    if (pending) {
      throw new ConflictException('Unable to process access request');
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const row = this.requestRepo.create({
      id,
      email,
      username,
      passwordHash,
      justification: (dto.reason || '').trim(),
      status: 'pending',
      createdAt: now,
      reviewedAt: null,
      reviewedBy: null,
    });
    await this.requestRepo.insert(row);

    await this.audit.record('anonymous', 'access_request_submit', id, {
      email,
      username,
    });

    const pendingCount = await this.requestRepo.count({
      where: { status: 'pending' },
    });
    if (pendingCount >= 5) {
      await this.alerts.raise(
        'high',
        'access_request_burst',
        `${pendingCount} pending Document Ops access requests`,
        'access_request_submit',
      );
    }

    return {
      message: 'Access request submitted for review',
      email,
      status: 'pending',
    };
  }

  async list(status?: AccessRequestStatus): Promise<AccessRequestListItem[]> {
    const where = status ? { status } : {};
    const rows = await this.requestRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.toListItem(r));
  }

  async approve(id: string, actorId: string): Promise<AccessRequestListItem> {
    const row = await this.requestRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Access request not found');
    if (row.status !== 'pending') {
      throw new BadRequestException(`Request already ${row.status}`);
    }

    const existingUser = await this.userRepo.findOne({ where: { email: row.email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    const now = new Date().toISOString();
    const userId = randomUUID();
    const user = this.userRepo.create({
      id: userId,
      email: row.email,
      username: row.username,
      password: row.passwordHash,
      role: 'moderator',
      createdAt: now,
      updatedAt: now,
    });
    await this.userRepo.insert(user);

    row.status = 'approved';
    row.reviewedAt = now;
    row.reviewedBy = actorId;
    await this.requestRepo.save(row);

    await this.audit.record(actorId, 'access_request_approve', id, {
      email: row.email,
      newUserId: userId,
      newRole: 'moderator',
    });

    return this.toListItem(row);
  }

  async deny(id: string, actorId: string): Promise<AccessRequestListItem> {
    const row = await this.requestRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Access request not found');
    if (row.status !== 'pending') {
      throw new BadRequestException(`Request already ${row.status}`);
    }

    const now = new Date().toISOString();
    row.status = 'denied';
    row.reviewedAt = now;
    row.reviewedBy = actorId;
    // Drop password material once denied
    row.passwordHash = '';
    await this.requestRepo.save(row);

    await this.audit.record(actorId, 'access_request_deny', id, {
      email: row.email,
    });

    return this.toListItem(row);
  }

  private toListItem(r: AccessRequestEntity): AccessRequestListItem {
    return {
      id: r.id,
      email: r.email,
      username: r.username,
      justification: r.justification,
      status: r.status,
      createdAt: r.createdAt,
      reviewedAt: r.reviewedAt,
      reviewedBy: r.reviewedBy,
    };
  }
}
