import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { LinkBookmarkEntity } from './entities/link-bookmark.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(LinkBookmarkEntity)
    private readonly bookmarkRepo: Repository<LinkBookmarkEntity>,
  ) {}

  async save(userId: string, url: string, title?: string | null) {
    const row = this.bookmarkRepo.create({
      id: randomUUID(),
      userId,
      url,
      title: title ?? null,
      createdAt: new Date().toISOString(),
    });
    await this.bookmarkRepo.save(row);
    return {
      id: row.id,
      url: row.url,
      title: row.title,
      createdAt: row.createdAt,
      message: 'Bookmark saved',
    };
  }

  async listForUser(userId: string) {
    const rows = await this.bookmarkRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return { items: rows };
  }
}
