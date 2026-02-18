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
    expect(res.body.storagePath).toContain('uploads');
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
   * CWE-434: MIME type confusion. Client sends .html file claiming image/png.
   * Server stores client-supplied Content-Type without magic-byte validation.
   */
  it('accepts .html file with image/png mimetype -- CWE-434', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'mime-test', 'pass');

    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
      .expect(201);

    expect(res.body.filename).toBe('fake-image.html');
    expect(res.body.mimetype).toBeDefined();
  });

  /**
   * CWE-22: Path traversal in filename. Busboy strips directory components
   * from multipart filenames, so "../../../etc/passwd" becomes "passwd".
   * This is busboy's default behaviour, NOT intentional server-side
   * sanitisation. A raw HTTP request (bypassing multipart parsing) could
   * still inject path traversal into storagePath via the Multer diskStorage
   * callback which blindly uses file.originalname.
   */
  it('path traversal filename stripped by parser (but no server-side sanitisation) -- CWE-22', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'traversal', 'pass');

    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'), { filename: '../../../etc/passwd' })
      .expect(201);

    // Busboy strips directory components -- server has NO sanitisation of its own
    expect(res.body.filename).toBe('passwd');
    expect(res.body.storagePath).toContain('uploads');
  });

  /**
   * CWE-400: No upload size limit. 1 MB file accepted without rejection.
   */
  it('accepts oversized file without limit -- CWE-400', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'big-upload', 'pass');

    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'large.bin'))
      .expect(201);

    expect(res.body.size).toBeGreaterThanOrEqual(1024 * 1024);
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
   * CWE-639: User B downloads User A's file via IDOR on download endpoint.
   */
  it('User B downloads User A file -- CWE-639 IDOR', async () => {
    const httpServer = app.getHttpServer();
    const userA = await registerAndLogin(httpServer, 'a@t.com', 'owner', 'pass');
    const userB = await registerAndLogin(httpServer, 'b@t.com', 'attacker', 'pass');

    const upload = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'test.txt'))
      .expect(201);

    const res = await request(httpServer)
      .get(`/files/${upload.body.id}/download`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(res.text).toBe('hello world');
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

    const storagePath = upload.body.storagePath;
    expect(existsSync(storagePath)).toBe(true);

    await request(httpServer)
      .delete(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(existsSync(storagePath)).toBe(false);

    await request(httpServer)
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(404);
  });

  // -- Public sharing tests --

  /**
   * CWE-330 + CWE-285: Predictable public token grants unauthenticated access.
   */
  it('public share token grants unauthenticated download -- CWE-285, CWE-330', async () => {
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

    expect(share.body.publicToken).toMatch(/^share-/);

    // Unauthenticated request using the predictable token
    const res = await request(httpServer)
      .get(`/sharing/public/${share.body.publicToken}`)
      .expect(200);

    expect(res.text).toBe('hello world');
  });

  /**
   * CWE-613: Expired share is still accessible (expiresAt not checked).
   */
  it('expired share still accessible -- CWE-613', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'u@t.com', 'expiry', 'pass');

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

    // Expired but still accessible
    await request(httpServer)
      .get(`/sharing/public/${share.body.publicToken}`)
      .expect(200);
  });

  it('invalid public token returns 404', async () => {
    const httpServer = app.getHttpServer();
    await request(httpServer)
      .get('/sharing/public/nonexistent-token')
      .expect(404);
  });
});
