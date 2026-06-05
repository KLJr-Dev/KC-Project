import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';

/**
 * v0.5.1 — File Download & Streaming Tests
 *
 * End-to-end tests for GET /files/:id/download.
 * Uses the same API contract as files.e2e-spec.ts (POST /files, /auth/register).
 */

const UPLOADS_DIR = join(process.cwd(), 'uploads');
const TEST_FIXTURES = join(process.cwd(), 'test', 'fixtures');

async function registerAndLogin(
  httpServer: App,
  email: string,
  username: string,
  password: string,
): Promise<{ token: string; userId: string }> {
  await request(httpServer).post('/auth/register').send({ email, username, password });
  const loginRes = await request(httpServer)
    .post('/auth/login')
    .send({ email, password })
    .expect(201);
  return { token: loginRes.body.token, userId: loginRes.body.userId };
}

function ensureFixtures() {
  if (!existsSync(TEST_FIXTURES)) mkdirSync(TEST_FIXTURES, { recursive: true });
  writeFileSync(join(TEST_FIXTURES, 'test.txt'), 'hello world');
  writeFileSync(join(TEST_FIXTURES, 'large.bin'), Buffer.alloc(5 * 1024 * 1024, 'x'));
}

describe('File Download (v0.5.1)', () => {
  let app: INestApplication<App>;

  beforeAll(() => {
    ensureFixtures();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
    if (existsSync(UPLOADS_DIR)) {
      for (const f of require('fs').readdirSync(UPLOADS_DIR)) {
        if (f !== '.gitkeep') {
          try {
            rmSync(join(UPLOADS_DIR, f));
          } catch {}
        }
      }
    }
  });

  afterAll(() => {
    if (existsSync(TEST_FIXTURES)) rmSync(TEST_FIXTURES, { recursive: true });
  });

  it('downloads file with correct content and content-type', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'dl@t.com', 'downloader', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const downloadRes = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(downloadRes.text).toBe('hello world');
    expect(downloadRes.headers['content-type']).toBeDefined();
  });

  it('includes Content-Disposition header', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'cd@t.com', 'cduser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'), 'report.pdf')
      .expect(201);

    const downloadRes = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(downloadRes.headers['content-disposition']).toMatch(/attachment/);
  });

  it('allows User B to download User A file (CWE-639 IDOR)', async () => {
    const httpServer = app.getHttpServer();
    const userA = await registerAndLogin(httpServer, 'a-dl@t.com', 'ownerdl', 'pass');
    const userB = await registerAndLogin(httpServer, 'b-dl@t.com', 'attackerdl', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const downloadRes = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(downloadRes.text).toBe('hello world');
  });

  it('returns 404 for non-existent file ID', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'nf@t.com', 'nfuser', 'pass');

    await request(httpServer)
      .get('/files/99999/download')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  it('returns 404 if disk file is missing (orphaned record)', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'orph@t.com', 'orphuser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const getRes = await request(httpServer)
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    if (existsSync(getRes.body.storagePath)) {
      rmSync(getRes.body.storagePath, { force: true });
    }

    await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  it('returns 401 for unauthenticated download', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'auth@t.com', 'authuser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    await request(httpServer).get(`/files/${upload.body.id}/download`).expect(401);
  });

  it('streams large file', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'lg@t.com', 'largeuser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'large.bin'))
      .expect(201);

    const downloadRes = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(downloadRes.body.length).toBe(5 * 1024 * 1024);
  });

  it('exposes storagePath in metadata (CWE-200)', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'sp@t.com', 'spathuser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const getRes = await request(httpServer)
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(getRes.body.storagePath).toMatch(/uploads/);
  });
});
