/**
 * Cycle-4 regression lock (v2.2.0) — secure tip must fail the v1.2.0 writeup chain.
 *
 * Maps to PenTest on ctf/v1.2.0:
 *   C4-F01  stored XSS body round-trips as data; no unsafe-markdown / HTML sink in UI
 *   C4-F01b SVG/HTML attachments rejected; disposition is download
 *   C4-F02  SeedDemoNotes / neutralize migration have no labpass / Cycle-4 OS{ plants
 *   foreign GET /notes/:id → 403 (ownership; named for Blue gate)
 *
 * Host SSH unpublished (C4-F03) is asserted in infra/smoke-test.sh
 * via assert-ssh-unpublished.sh (not this Jest file).
 */
process.env.MIGRATIONS_RUN = 'false';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';
import {
  CYCLE4_FLAG_F1,
  CYCLE4_FLAG_F2,
  CYCLE4_SSH_LAB_PASSWORD,
} from '../src/notes/cycle4-plants';

const STRONG = 'Password123!';
const XSS_POC = '<img src=x onerror="alert(1)">';

const REPO_ROOT = join(process.cwd(), '..');
const SEED_DEMO_NOTES = join(
  process.cwd(),
  'src/migrations/1777600000001-SeedDemoNotes.ts',
);
const NEUTRALIZE = join(
  process.cwd(),
  'src/migrations/1777700000000-NeutralizeCycle4NotePlants.ts',
);
const UNSAFE_MD = join(REPO_ROOT, 'frontend/lib/unsafe-markdown.ts');
const NOTE_DETAIL = join(REPO_ROOT, 'frontend/app/notes/[id]/page.tsx');

describe('Cycle-4 regression — Notes XSS / plants / IDOR must fail (v2.2.0)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
    );
    app.useGlobalFilters(new ValidationExceptionFilter());
    await app.init();
    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerAndLogin(
    email: string,
    username: string,
  ): Promise<{ token: string; userId: string }> {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password: STRONG })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: STRONG })
      .expect(201);
    return { token: login.body.token as string, userId: login.body.userId as string };
  }

  it('C4-F01: XSS PoC body round-trips as plain string (API stores text)', async () => {
    const http = app.getHttpServer();
    const user = await registerAndLogin('c4-xss@example.com', 'c4_xss');

    const created = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'xss probe', body: XSS_POC })
      .expect(201);

    expect(created.body.body).toBe(XSS_POC);

    const got = await request(http)
      .get(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(got.body.body).toBe(XSS_POC);
  });

  it('C4-F01: secure tree has no unsafe-markdown; note detail has no HTML sink', () => {
    expect(existsSync(UNSAFE_MD)).toBe(false);

    const page = readFileSync(NOTE_DETAIL, 'utf8');
    // JSX prop only — comments may name the removed sink
    expect(page).not.toMatch(/dangerouslySetInnerHTML\s*=/);
    expect(page).toMatch(/\{note\.body\}/);
  });

  it('C4-F01b: SVG attachment rejected; txt downloads with attachment disposition', async () => {
    const http = app.getHttpServer();
    const user = await registerAndLogin('c4-att@example.com', 'c4_att');

    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .field('title', 'svg candy')
      .field('body', 'no')
      .attach('attachment', svg, 'payload.svg')
      .expect(400);

    const created = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .field('title', 'safe')
      .field('body', 'ok')
      .attach('attachment', Buffer.from('plain\n'), 'note.txt')
      .expect(201);

    const dl = await request(http)
      .get(`/notes/${created.body.id}/attachment`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(String(dl.headers['content-disposition'] || '')).toMatch(/attachment/i);
    expect(String(dl.headers['content-disposition'] || '')).not.toMatch(/inline/i);
  });

  it('ownership: user cannot GET foreign note (403)', async () => {
    const http = app.getHttpServer();
    const a = await registerAndLogin('c4-a@example.com', 'c4_user_a');
    const b = await registerAndLogin('c4-b@example.com', 'c4_user_b');

    const note = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'private', body: 'secret' })
      .expect(201);

    await request(http)
      .get(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${b.token}`)
      .expect(403);
  });

  it('C4-F02: secure SeedDemoNotes / neutralize have no labpass or Cycle-4 flags', () => {
    const seed = readFileSync(SEED_DEMO_NOTES, 'utf8');
    const neutralize = readFileSync(NEUTRALIZE, 'utf8');

    for (const src of [seed, neutralize]) {
      expect(src).not.toContain(CYCLE4_SSH_LAB_PASSWORD);
      expect(src).not.toContain(CYCLE4_FLAG_F1);
      expect(src).not.toContain(CYCLE4_FLAG_F2);
      expect(src).not.toMatch(/OS\{[0-9a-f]{32}\}/);
      expect(src).not.toMatch(/cycle4-plants/);
    }
  });
});
