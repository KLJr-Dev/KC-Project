import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';
import { AppModule } from '../src/app.module';

/**
 * v2.0.0 — File Download & Streaming Tests
 *
 * End-to-end tests for GET /files/:id/download with ownership enforcement,
 * verified MIME types, and no storagePath leakage in metadata responses.
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
  writeFileSync(join(TEST_FIXTURES, 'large.txt'), Buffer.alloc(4 * 1024 * 1024, 'x'));
}

function findUploadedDiskFile(): string | undefined {
  if (!existsSync(UPLOADS_DIR)) return undefined;
  const files = readdirSync(UPLOADS_DIR).filter((f) => f !== '.gitkeep');
  return files[0];
}

describe('File Download (v2.0.0)', () => {
  let app: INestApplication<App>;

  jest.setTimeout(60_000);

  beforeAll(() => {
    ensureFixtures();
  });

  beforeEach(async () => {
    ensureFixtures();

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
      for (const f of readdirSync(UPLOADS_DIR)) {
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
    expect(downloadRes.headers['content-type']).toContain('text/plain');
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
    expect(downloadRes.headers['content-disposition']).toContain('report.pdf');
  });

  it('denies User B from downloading User A file', async () => {
    const httpServer = app.getHttpServer();
    const userA = await registerAndLogin(httpServer, 'a-dl@t.com', 'ownerdl', 'pass');
    const userB = await registerAndLogin(httpServer, 'b-dl@t.com', 'attackerdl', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(403);
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

    const diskName = findUploadedDiskFile();
    expect(diskName).toBeDefined();
    rmSync(join(UPLOADS_DIR, diskName!), { force: true });

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

  it('streams large file within size limit', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'lg@t.com', 'largeuser', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'large.txt'))
      .expect(201);

    const downloadRes = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(downloadRes.text.length).toBe(4 * 1024 * 1024);
  });

  it('does not expose storagePath in metadata', async () => {
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

    expect(getRes.body.storagePath).toBeUndefined();
  });
});
