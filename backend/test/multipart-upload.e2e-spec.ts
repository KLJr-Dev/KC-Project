import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync, readFileSync } from 'fs';
import { AppModule } from '../src/app.module';

/**
 * v0.5.0 -- Real Multipart File Upload
 *
 * End-to-end tests specifically targeting the multipart/form-data file upload
 * surface introduced in v0.5.0. Covers Multer diskStorage, client-supplied
 * filenames, MIME type handling, file size tracking, and on-disk persistence.
 *
 * CWE-22  (Path Traversal via filename) | A01:2025
 * CWE-434 (MIME Type Confusion) | A06:2025
 * CWE-400 (Uncontrolled Resource Consumption — no size limit) | A06:2025
 * CWE-639 (IDOR on download/delete — no ownership check) | A01:2025
 * CWE-200 (Exposure of storagePath in responses) | A01:2025
 *
 * Multipart upload flow:
 * 1. POST /files with file field + optional description field
 * 2. Multer FileInterceptor saves to ./uploads/ with client-supplied filename
 * 3. FilesService.upload() stores metadata: filename, mimetype, storagePath, size
 * 4. FileResponseDto returned to client with all metadata (including storagePath CWE-200)
 * 5. GET /files/:id/download streams file from storagePath (no path validation CWE-22)
 * 6. GET /files/:id/download uses stored mimetype for Content-Type (CWE-434)
 * 7. DELETE /files/:id removes file from disk via fs.unlink(storagePath) (CWE-22, CWE-639)
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
): Promise<{ token: string; userId: string; role: string }> {
  await request(httpServer).post('/auth/register').send({ email, username, password });
  const loginRes = await request(httpServer)
    .post('/auth/login')
    .send({ email, password })
    .expect(201);
  return { token: loginRes.body.token, userId: loginRes.body.userId, role: loginRes.body.role };
}

function ensureFixtures() {
  if (!existsSync(TEST_FIXTURES)) mkdirSync(TEST_FIXTURES, { recursive: true });
  writeFileSync(join(TEST_FIXTURES, 'test.txt'), 'hello world');
  writeFileSync(join(TEST_FIXTURES, 'image.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47])); // PNG magic
  writeFileSync(join(TEST_FIXTURES, 'fake-image.html'), '<script>alert(1)</script>');
  writeFileSync(join(TEST_FIXTURES, 'large.bin'), Buffer.alloc(10 * 1024 * 1024, 'A')); // 10MB
}

describe('v0.5.0 -- Real Multipart File Upload', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  beforeAll(() => {
    ensureFixtures();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();

    // Clean up uploaded files
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

  // ============================================================
  // Basic Multipart Upload Tests
  // ============================================================

  describe('multipart/form-data upload', () => {
    it('uploads a file and returns metadata with storagePath (CWE-200)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user@test.com', 'uploader', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .field('description', 'Test file upload')
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('filename', 'test.txt');
      expect(res.body).toHaveProperty('mimetype');
      expect(res.body).toHaveProperty('storagePath'); // CWE-200: exposes FS path
      expect(res.body).toHaveProperty('size');
      expect(res.body).toHaveProperty('ownerId', user.userId);
      expect(res.body).toHaveProperty('uploadedAt');
    });

    it('rejects file upload without authentication', async () => {
      const httpServer = app.getHttpServer();

      await request(httpServer)
        .post('/files')
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(401);
    });

    it('stores file on disk in uploads/ directory', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user2@test.com', 'uploader2', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const storagePath = res.body.storagePath;
      expect(storagePath).toContain('uploads');
      expect(existsSync(storagePath)).toBe(true);
      expect(readFileSync(storagePath, 'utf-8')).toBe('hello world');
    });

    it('includes optional description field in metadata', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user3@test.com', 'uploader3', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .field('description', 'My custom description')
        .expect(201);

      expect(res.body.description).toBe('My custom description');
    });

    it('uses client-supplied filename as disk filename (CWE-22)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user4@test.com', 'uploader4', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      // Vulnerable: client filename used directly
      expect(res.body.filename).toBe('test.txt');
      expect(res.body.storagePath).toContain('test.txt');
    });

    it('stores client-supplied MIME type without validation (CWE-434)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user5@test.com', 'uploader5', 'password');

      // Upload HTML file but claim it's an image
      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
        .expect(201);

      // Multer may guess from extension, but no validation happens
      expect(res.body).toHaveProperty('mimetype');
      // Vulnerable: no magic-byte validation, client could have forced image/png
    });

    it('tracks file size from Multer stats', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user6@test.com', 'uploader6', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      expect(res.body.size).toBe(11); // 'hello world' is 11 bytes
    });
  });

  // ============================================================
  // File Listing Tests
  // ============================================================

  describe('file listing', () => {
    it('lists all uploaded files (unbounded, CWE-400)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'lister@test.com', 'lister', 'password');

      // Upload two files
      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'));

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'image.png'));

      const res = await request(httpServer)
        .get('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
    });

    it('retrieves file metadata by ID', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'fetcher@test.com', 'fetcher', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'));

      const fileId = uploadRes.body.id;

      const getRes = await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(getRes.body.id).toBe(fileId);
      expect(getRes.body.filename).toBe('test.txt');
    });

    it('returns 404 for non-existent file ID', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'fetcher2@test.com', 'fetcher2', 'password');

      await request(httpServer)
        .get('/files/999')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);
    });
  });

  // ============================================================
  // File Download Tests
  // ============================================================

  describe('file download', () => {
    it('downloads file and returns stored MIME type (CWE-434)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'downloader@test.com', 'downloader', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'image.png'))
        .expect(201);

      const fileId = uploadRes.body.id;
      const originalMimetype = uploadRes.body.mimetype;

      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      // Content-Type is set from stored mimetype (client-controlled, CWE-434)
      if (originalMimetype) {
        expect(downloadRes.headers['content-type']).toContain(originalMimetype);
      }
    });

    it('streams file without ownership check (CWE-639 IDOR)', async () => {
      const httpServer = app.getHttpServer();
      const user1 = await registerAndLogin(httpServer, 'attacker@test.com', 'attacker', 'password');
      const user2 = await registerAndLogin(httpServer, 'victim@test.com', 'victim', 'password');

      // User2 uploads a file
      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user2.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      // User1 (attacker) can download user2's file (no ownership check)
      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(200);

      expect(downloadRes.text).toBe('hello world');
    });

    it('sets Content-Disposition with filename', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'downloader2@test.com', 'downloader2', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(downloadRes.headers['content-disposition']).toContain('attachment');
      expect(downloadRes.headers['content-disposition']).toContain('test.txt');
    });

    it('returns 404 for non-existent file on download', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'downloader3@test.com', 'downloader3', 'password');

      await request(httpServer)
        .get('/files/999/download')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);
    });
  });

  // ============================================================
  // File Deletion Tests
  // ============================================================

  describe('file deletion', () => {
    it('deletes file from disk and database', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'deleter@test.com', 'deleter', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;
      const storagePath = uploadRes.body.storagePath;

      // Verify file exists on disk
      expect(existsSync(storagePath)).toBe(true);

      // Delete file
      await request(httpServer)
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      // File should be gone from disk
      expect(existsSync(storagePath)).toBe(false);

      // Metadata should be gone from DB
      await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);
    });

    it('deletes file without ownership check (CWE-639 IDOR)', async () => {
      const httpServer = app.getHttpServer();
      const user1 = await registerAndLogin(httpServer, 'attacker2@test.com', 'attacker2', 'password');
      const user2 = await registerAndLogin(httpServer, 'victim2@test.com', 'victim2', 'password');

      // User2 uploads a file
      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user2.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      // User1 (attacker) can delete user2's file (no ownership check)
      await request(httpServer)
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(200);

      // File is deleted
      await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(404);
    });

    it('returns 404 for non-existent file on delete', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'deleter2@test.com', 'deleter2', 'password');

      await request(httpServer)
        .delete('/files/999')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);
    });
  });

  // ============================================================
  // Path Traversal & Filename Sanitisation Tests (CWE-22)
  // ============================================================

  describe('path traversal vulnerability (CWE-22)', () => {
    it('allows path traversal in filename when client supplies "../" (vulnerable)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'traverser@test.com', 'traverser', 'password');

      // Create a test file with path traversal attempt
      const testDir = join(TEST_FIXTURES, 'traversal');
      if (!existsSync(testDir)) mkdirSync(testDir, { recursive: true });
      writeFileSync(join(testDir, '../../../etc_passwd_attempt.txt'), 'traversal test');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(testDir, '../../../etc_passwd_attempt.txt'))
        .expect(201);

      // File is created with the traversal path in filename (CWE-22 vulnerable)
      expect(res.body.filename).toContain('..');
      expect(res.body.storagePath).toContain('..');

      // Cleanup
      try {
        rmSync(testDir, { recursive: true });
      } catch {}
    });

    it('stores absolute storagePath, exposing directory structure (CWE-200)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'pathexpose@test.com', 'pathexpose', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      // storagePath is absolute path on server (CWE-200)
      expect(res.body.storagePath).toMatch(/^\//); // Unix absolute path
      expect(res.body.storagePath).toContain('uploads');
    });
  });

  // ============================================================
  // MIME Type Confusion Tests (CWE-434)
  // ============================================================

  describe('MIME type confusion (CWE-434)', () => {
    it('accepts and stores client-supplied Content-Type without validation', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'mimefool@test.com', 'mimefool', 'password');

      // Upload HTML but claim it's JSON
      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
        .expect(201);

      // Mimetype stored without validation (could be faked)
      expect(res.body).toHaveProperty('mimetype');
      // Vulnerable: no magic-byte validation
    });

    it('download returns stored MIME type to client', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'mimedownload@test.com', 'mimedownload', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
        .expect(201);

      const fileId = uploadRes.body.id;

      // Download uses stored MIME type for Content-Type header
      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      // Content-Type reflects stored mimetype (client-controlled, CWE-434)
      expect(downloadRes.headers['content-type']).toBeDefined();
    });
  });

  // ============================================================
  // File Size Limits Tests (CWE-400)
  // ============================================================

  describe('file size limits (CWE-400)', () => {
    it('allows unbounded file uploads (no size limit configured)', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'uploader_large@test.com', 'uploader_large', 'password');

      // Attempt to upload a 10MB file
      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'large.bin'))
        .expect(201); // Vulnerable: no size limit, upload succeeds

      expect(res.body.size).toBe(10 * 1024 * 1024);
    });
  });

  // ============================================================
  // Approval Status Tests (v0.4.3 carryover)
  // ============================================================

  describe('file approval status', () => {
    it('defaults to pending approval status', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'approval@test.com', 'approval', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      expect(res.body).toHaveProperty('approvalStatus', 'pending');
    });

    it('includes approvalStatus in file metadata', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'approval2@test.com', 'approval2', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      const getRes = await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(getRes.body.approvalStatus).toBe('pending');
    });
  });
});
