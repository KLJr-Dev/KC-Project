/**
 * Cycle-4 SoftDev — Notes API e2e (P1a/P1b/P1c).
 *
 * Covers owner CRUD, tertiary RBAC (mod flag / admin delete), parameterized `q`,
 * attachment upload + inline SVG/HTML, and ensures response omits attachmentStoragePath.
 *
 * Requires reachable Postgres (same as other backend e2e suites).
 * Schema via synchronize(true) — skip migrations to avoid seed enum clashes on lab DBs.
 */
process.env.MIGRATIONS_RUN = 'false';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { join } from 'path';
import { rmSync } from 'fs';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';
import { User } from '../src/users/entities/user.entity';

const NOTES_UPLOADS = join(process.cwd(), 'uploads', 'notes');

const STRONG = 'Password123!';

async function registerAndLogin(
  httpServer: App,
  email: string,
  username: string,
): Promise<{ token: string; userId: string }> {
  await request(httpServer)
    .post('/auth/register')
    .send({ email, username, password: STRONG })
    .expect(201);
  const login = await request(httpServer)
    .post('/auth/login')
    .send({ email, password: STRONG })
    .expect(201);
  return { token: login.body.token as string, userId: login.body.userId as string };
}

describe('Notes API — Cycle-4 SoftDev (v1.2.0)', () => {
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
    try {
      rmSync(NOTES_UPLOADS, { recursive: true, force: true });
    } catch {
      /* dir may not exist yet */
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('owner CRUD: create, list own, get, update, delete', async () => {
    const http = app.getHttpServer();
    const user = await registerAndLogin(http, 'notes-owner@t.com', 'notes_owner');

    const created = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Hello', body: '<b>world</b>' })
      .expect(201);

    expect(created.body.id).toBeDefined();
    expect(created.body.ownerId).toBe(user.userId);
    expect(created.body.title).toBe('Hello');
    expect(created.body.body).toBe('<b>world</b>');
    expect(created.body.flagged).toBe(false);
    expect(created.body.hasAttachment).toBe(false);
    expect(created.body.attachmentStoragePath).toBeUndefined();

    const list = await request(http)
      .get('/notes')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(list.body.items.length).toBe(1);

    const got = await request(http)
      .get(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);
    expect(got.body.body).toBe('<b>world</b>');

    const updated = await request(http)
      .put(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ title: 'Hi', body: 'plain' })
      .expect(200);
    expect(updated.body.title).toBe('Hi');

    await request(http)
      .delete(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    await request(http)
      .get(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  it('user cannot read or delete another user note; admin can delete', async () => {
    const http = app.getHttpServer();
    const a = await registerAndLogin(http, 'a@t.com', 'user_a');
    const b = await registerAndLogin(http, 'b@t.com', 'user_b');

    const note = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${a.token}`)
      .send({ title: 'secret', body: 'nope' })
      .expect(201);

    await request(http)
      .get(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${b.token}`)
      .expect(403);

    await request(http)
      .delete(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${b.token}`)
      .expect(403);

    await dataSource.getRepository(User).update({ id: b.userId }, { role: 'admin' });
    // Re-login so JWT path still works; HasRoleGuard reloads DB role by sub.
    const adminLogin = await request(http)
      .post('/auth/login')
      .send({ email: 'b@t.com', password: STRONG })
      .expect(201);

    await request(http)
      .get(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .expect(200);

    await request(http)
      .delete(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${adminLogin.body.token}`)
      .expect(200);
  });

  it('moderator can list/get/flag others but cannot delete others', async () => {
    const http = app.getHttpServer();
    const owner = await registerAndLogin(http, 'own@t.com', 'note_own');
    const mod = await registerAndLogin(http, 'mod@t.com', 'note_mod');
    await dataSource.getRepository(User).update({ id: mod.userId }, { role: 'moderator' });
    const modLogin = await request(http)
      .post('/auth/login')
      .send({ email: 'mod@t.com', password: STRONG })
      .expect(201);
    const modToken = modLogin.body.token as string;

    const note = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ title: 'ops', body: 'ssh stuff' })
      .expect(201);

    const list = await request(http)
      .get('/notes')
      .set('Authorization', `Bearer ${modToken}`)
      .expect(200);
    expect(list.body.items.some((n: { id: string }) => n.id === note.body.id)).toBe(true);

    await request(http)
      .put(`/notes/${note.body.id}/flag`)
      .set('Authorization', `Bearer ${modToken}`)
      .send({ flagged: true })
      .expect(200)
      .expect((res) => {
        expect(res.body.flagged).toBe(true);
      });

    await request(http)
      .delete(`/notes/${note.body.id}`)
      .set('Authorization', `Bearer ${modToken}`)
      .expect(403);

    // plain user cannot flag
    await request(http)
      .put(`/notes/${note.body.id}/flag`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ flagged: false })
      .expect(403);
  });

  it('parameterized q filters notes; does not expose others to user role', async () => {
    const http = app.getHttpServer();
    const u = await registerAndLogin(http, 'q@t.com', 'note_q');
    await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ title: 'alpha ssh', body: 'one' })
      .expect(201);
    await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${u.token}`)
      .send({ title: 'beta', body: 'two' })
      .expect(201);

    const hit = await request(http)
      .get('/notes')
      .query({ q: 'ssh' })
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
    expect(hit.body.items.length).toBe(1);
    expect(hit.body.items[0].title).toContain('ssh');

    // Injection-looking q must not 500 (parameterized)
    await request(http)
      .get('/notes')
      .query({ q: "'; DROP TABLE note_entity;--" })
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
  });

  it('multipart attachment: SVG inline for owner; cross-user 403', async () => {
    const http = app.getHttpServer();
    const a = await registerAndLogin(http, 'att-a@t.com', 'att_a');
    const b = await registerAndLogin(http, 'att-b@t.com', 'att_b');

    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
    );
    const created = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${a.token}`)
      .field('title', 'xss candy')
      .field('body', 'see attachment')
      .attach('attachment', svg, 'payload.svg')
      .expect(201);

    expect(created.body.hasAttachment).toBe(true);
    expect(created.body.attachmentFilename).toBe('payload.svg');
    expect(created.body.attachmentMimetype).toMatch(/svg/i);
    expect(created.body.attachmentStoragePath).toBeUndefined();

    const dl = await request(http)
      .get(`/notes/${created.body.id}/attachment`)
      .set('Authorization', `Bearer ${a.token}`)
      .expect(200);
    expect(String(dl.headers['content-disposition'] || '')).toMatch(/inline/i);
    expect(String(dl.headers['content-type'] || '')).toMatch(/svg/i);
    const svgBody = Buffer.isBuffer(dl.body)
      ? dl.body.toString('utf8')
      : String(dl.text ?? dl.body ?? '');
    expect(svgBody).toContain('<svg');

    await request(http)
      .get(`/notes/${created.body.id}/attachment`)
      .set('Authorization', `Bearer ${b.token}`)
      .expect(403);

    await request(http)
      .delete(`/notes/${created.body.id}`)
      .set('Authorization', `Bearer ${a.token}`)
      .expect(200);
  });

  it('HTML attachment served inline; exe extension rejected', async () => {
    const http = app.getHttpServer();
    const u = await registerAndLogin(http, 'html-att@t.com', 'html_att');

    const html = Buffer.from('<!doctype html><html><body><script>x</script></body></html>');
    const created = await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${u.token}`)
      .field('title', 'html')
      .field('body', 'h')
      .attach('attachment', html, 'note.html')
      .expect(201);

    const dl = await request(http)
      .get(`/notes/${created.body.id}/attachment`)
      .set('Authorization', `Bearer ${u.token}`)
      .expect(200);
    expect(String(dl.headers['content-disposition'] || '')).toMatch(/inline/i);
    expect(String(dl.headers['content-type'] || '')).toMatch(/html/i);

    await request(http)
      .post('/notes')
      .set('Authorization', `Bearer ${u.token}`)
      .field('title', 'bad')
      .field('body', 'no')
      .attach('attachment', Buffer.from('MZ'), 'evil.exe')
      .expect(400);
  });
});
