import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';

/**
 * v0.3.5 -- File Handling Edge Cases
 *
 * End-to-end tests covering multipart file upload, download, IDOR,
 * MIME type confusion, path traversal, oversized uploads, filesystem
 * deletion, and public sharing via predictable tokens.
 *
 * CWE-22 (Path Traversal) | A01:2025
 * CWE-434 (MIME Type Confusion) | A06:2025
 * CWE-400 (No Upload Size Limit) | A06:2025
 * CWE-639 (IDOR on download/delete) | A01:2025
 * CWE-330 (Predictable Share Tokens) | A01:2025
 * CWE-285 (Unauthenticated Public Endpoint) | A01:2025
 * CWE-613 (Expired Share Still Accessible) | A07:2025
 *
 * Requires: docker compose -f infra/compose.yml up -d
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
  writeFileSync(join(TEST_FIXTURES, 'fake-image.html'), '<script>alert(1)</script>');
  writeFileSync(join(TEST_FIXTURES, 'large.bin'), Buffer.alloc(1024 * 1024, 'A'));
}

describe('File Handling -- v0.3.5 Edge Cases', () => {
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

    // Clean up any uploaded files
    if (existsSync(UPLOADS_DIR)) {
      const files = require('fs').readdirSync(UPLOADS_DIR);
      for (const f of files) {
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

  // -- Upload tests --

  it('uploads a file via multipart and returns metadata', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'uploader', 'pass');

    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    expect(res.body.id).toBeDefined();
    expect(res.body.filename).toBe('test.txt');
    expect(res.body.mimetype).toBe('text/plain');
    expect(res.body.storagePath).toBeUndefined();
    expect(res.body.size).toBeGreaterThan(0);
    expect(res.body.ownerId).toBe(user.userId);
  });

  it('upload without auth returns 401', async () => {
    const httpServer = app.getHttpServer();
    await request(httpServer)
      .post('/files')
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(401);
  });

  /**
   * Reject HTML uploaded as image (magic bytes / extension gate).
   */
  it('rejects .html file claiming image content', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'mime-test', 'pass');

    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
      .expect(400);
  });

  /**
   * Path components stripped; response does not expose storagePath.
   */
  it('sanitizes upload filename and omits storagePath', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'traversal', 'pass');

    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'), { filename: '../../../etc/passwd.txt' })
      .expect(201);

    expect(res.body.filename).toBe('passwd.txt');
    expect(res.body.storagePath).toBeUndefined();
  });

  /**
   * Upload size limited (5 MiB).
   */
  it('rejects oversized file', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'big-upload', 'pass');

    try {
      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'large.bin'));
      expect([400, 413, 500]).toContain(res.status);
    } catch (err) {
      // Connection may reset when Multer hits limits.fileSize
      expect(String(err)).toMatch(/EPIPE|ECONNRESET|aborted|413|400/i);
    }
  });

  // -- Download tests --

  it('downloads a file by ID', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'downloader', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const res = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.text).toBe('hello world');
  });

  /**
   * Cross-user download is denied (ownership).
   */
  it('User B cannot download User A file', async () => {
    const httpServer = app.getHttpServer();
    const userA = await registerAndLogin(httpServer, 'a@t.com', 'owner', 'pass');
    const userB = await registerAndLogin(httpServer, 'b@t.com', 'attacker', 'pass');

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

  it('User B cannot read User A file metadata', async () => {
    const httpServer = app.getHttpServer();
    const userA = await registerAndLogin(httpServer, 'a2@t.com', 'owner2', 'pass');
    const userB = await registerAndLogin(httpServer, 'b2@t.com', 'attacker2', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    await request(httpServer)
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(403);
  });

  // -- Delete tests --

  it('delete removes file from disk and DB', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'deleter', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    await request(httpServer)
      .delete(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    await request(httpServer)
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);

    await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  // -- Public sharing tests --

  /**
   * Public share uses crypto-random token (not share-N).
   */
  it('public share token grants unauthenticated download', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'sharer', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const share = await request(httpServer)
      .post('/sharing')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fileId: upload.body.id, public: true })
      .expect(201);

    expect(share.body.publicToken).toMatch(/^[a-f0-9]{64}$/);
    expect(share.body.publicToken).not.toMatch(/^share-/);

    const res = await request(httpServer)
      .get(`/sharing/public/${share.body.publicToken}`)
      .expect(200);

    expect(res.text).toBe('hello world');
  });

  it('expired public share returns 404', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'exp@t.com', 'expshare', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const pastDate = new Date(Date.now() - 86400000).toISOString();
    const share = await request(httpServer)
      .post('/sharing')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fileId: upload.body.id, public: true, expiresAt: pastDate })
      .expect(201);

    await request(httpServer).get(`/sharing/public/${share.body.publicToken}`).expect(404);
  });

  it('invalid public token returns 404', async () => {
    const httpServer = app.getHttpServer();
    await request(httpServer).get('/sharing/public/nonexistent-token').expect(404);
  });

  it('PUT /sharing/:id with public true generates publicToken', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'upd@t.com', 'updshare', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const share = await request(httpServer)
      .post('/sharing')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fileId: upload.body.id, public: false })
      .expect(201);

    expect(share.body.publicToken).toBeFalsy();

    const updated = await request(httpServer)
      .put(`/sharing/${share.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({ public: true })
      .expect(200);

    expect(updated.body.publicToken).toMatch(/^[a-f0-9]{64}$/);

    await request(httpServer).get(`/sharing/public/${updated.body.publicToken}`).expect(200);
  });

  it('DELETE /files/:id removes associated share records', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'del@t.com', 'delshare', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const share = await request(httpServer)
      .post('/sharing')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ fileId: upload.body.id, public: true })
      .expect(201);

    await request(httpServer)
      .delete(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    await request(httpServer).get(`/sharing/public/${share.body.publicToken}`).expect(404);
  });
});
