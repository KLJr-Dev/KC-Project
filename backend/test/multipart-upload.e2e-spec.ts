import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync, readFileSync, readdirSync } from 'fs';
import { AppModule } from '../src/app.module';

/**
 * v2.0.0 — Secure Multipart File Upload
 *
 * End-to-end tests for multipart/form-data upload, download, listing, and
 * deletion with v2.0.0 security controls: filename sanitisation, magic-byte
 * MIME detection, upload size limits, ownership enforcement, and no
 * storagePath leakage in API responses.
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
  writeFileSync(join(TEST_FIXTURES, 'image.png'), Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  ]));
  writeFileSync(join(TEST_FIXTURES, 'fake-image.html'), '<script>alert(1)</script>');
  writeFileSync(join(TEST_FIXTURES, 'large.bin'), Buffer.alloc(10 * 1024 * 1024, 'A')); // 10MB
}

function listUploadDiskFiles(): string[] {
  if (!existsSync(UPLOADS_DIR)) return [];
  return readdirSync(UPLOADS_DIR).filter((f) => f !== '.gitkeep');
}

function findDiskFileForBasename(basename: string): string | undefined {
  return listUploadDiskFiles().find((f) => f.endsWith(`-${basename}`) || f === basename);
}

describe('v2.0.0 — Secure Multipart File Upload', () => {
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

    await app.get(DataSource).synchronize(true);
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

  // ============================================================
  // Basic Multipart Upload Tests
  // ============================================================

  describe('multipart/form-data upload', () => {
    it('uploads a file and returns metadata without storagePath', async () => {
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
      expect(res.body).toHaveProperty('mimetype', 'text/plain');
      expect(res.body.storagePath).toBeUndefined();
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

    it('stores file on disk in uploads/ directory with UUID-prefixed name', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user2@test.com', 'uploader2', 'password');

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const diskName = findDiskFileForBasename('test.txt');
      expect(diskName).toBeDefined();
      expect(diskName).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-test\.txt$/,
      );
      const diskPath = join(UPLOADS_DIR, diskName!);
      expect(existsSync(diskPath)).toBe(true);
      expect(readFileSync(diskPath, 'utf-8')).toBe('hello world');
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

    it('sanitizes client filename to basename for display', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user4@test.com', 'uploader4', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'), '../../../etc/passwd.txt')
        .expect(201);

      expect(res.body.filename).toBe('passwd.txt');
      expect(res.body.storagePath).toBeUndefined();
      const diskName = findDiskFileForBasename('passwd.txt');
      expect(diskName).toMatch(/^[0-9a-f-]+-passwd\.txt$/);
    });

    it('detects MIME type from magic bytes', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'user5@test.com', 'uploader5', 'password');

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'image.png'))
        .expect(201);

      expect(res.body.mimetype).toBe('image/png');
    });

    it('tracks file size from verified content', async () => {
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
    it('lists owner uploaded files only', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'lister@test.com', 'lister', 'password');
      const other = await registerAndLogin(httpServer, 'other@test.com', 'other', 'password');

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'));

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'image.png'));

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${other.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'));

      const res = await request(httpServer)
        .get('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(Array.isArray(res.body.items)).toBe(true);
      expect(res.body.items.length).toBe(2);
      expect(res.body.total).toBe(2);
      for (const item of res.body.items) {
        expect(item.ownerId).toBe(user.userId);
        expect(item.storagePath).toBeUndefined();
      }
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
      expect(getRes.body.storagePath).toBeUndefined();
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
    it('downloads file with magic-byte detected MIME type', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'downloader@test.com',
        'downloader',
        'password',
      );

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'image.png'))
        .expect(201);

      const fileId = uploadRes.body.id;

      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(downloadRes.headers['content-type']).toContain('image/png');
    });

    it('denies cross-user download (ownership enforced)', async () => {
      const httpServer = app.getHttpServer();
      const user1 = await registerAndLogin(httpServer, 'attacker@test.com', 'attacker', 'password');
      const user2 = await registerAndLogin(httpServer, 'victim@test.com', 'victim', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user2.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(403);
    });

    it('sets Content-Disposition with filename', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'downloader2@test.com',
        'downloader2',
        'password',
      );

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
      const user = await registerAndLogin(
        httpServer,
        'downloader3@test.com',
        'downloader3',
        'password',
      );

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
      const diskName = findDiskFileForBasename('test.txt');
      expect(diskName).toBeDefined();
      const diskPath = join(UPLOADS_DIR, diskName!);
      expect(existsSync(diskPath)).toBe(true);

      await request(httpServer)
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(existsSync(diskPath)).toBe(false);

      await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(404);
    });

    it('denies cross-user delete (ownership enforced)', async () => {
      const httpServer = app.getHttpServer();
      const user1 = await registerAndLogin(
        httpServer,
        'attacker2@test.com',
        'attacker2',
        'password',
      );
      const user2 = await registerAndLogin(httpServer, 'victim2@test.com', 'victim2', 'password');

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user2.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      const fileId = uploadRes.body.id;

      await request(httpServer)
        .delete(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(403);

      await request(httpServer)
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(200);
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
  // Filename Sanitisation Tests
  // ============================================================

  describe('filename sanitisation', () => {
    it('strips path traversal components from client filename', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'traverser@test.com',
        'traverser',
        'password',
      );

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', Buffer.from('traversal attempt'), '../../../sensitive_file.txt')
        .expect(201);

      expect(res.body.filename).toBe('sensitive_file.txt');
      expect(res.body.storagePath).toBeUndefined();
      const diskName = findDiskFileForBasename('sensitive_file.txt');
      expect(diskName).toMatch(/^[0-9a-f-]+-sensitive_file\.txt$/);
      expect(existsSync(join(UPLOADS_DIR, diskName!))).toBe(true);
    });

    it('does not expose storagePath in API responses', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'pathexpose@test.com',
        'pathexpose',
        'password',
      );

      const res = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      expect(res.body.storagePath).toBeUndefined();
    });
  });

  // ============================================================
  // MIME Type Validation Tests
  // ============================================================

  describe('MIME type validation', () => {
    it('rejects disallowed file extensions such as .html', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(httpServer, 'mimefool@test.com', 'mimefool', 'password');

      await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'fake-image.html'))
        .expect(400);
    });

    it('download returns verified MIME type', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'mimedownload@test.com',
        'mimedownload',
        'password',
      );

      const uploadRes = await request(httpServer)
        .post('/files')
        .set('Authorization', `Bearer ${user.token}`)
        .attach('file', join(TEST_FIXTURES, 'test.txt'))
        .expect(201);

      expect(uploadRes.body.mimetype).toBe('text/plain');
      const fileId = uploadRes.body.id;

      const downloadRes = await request(httpServer)
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(downloadRes.headers['content-type']).toContain('text/plain');
    });
  });

  // ============================================================
  // File Size Limits Tests
  // ============================================================

  describe('file size limits', () => {
    it('rejects uploads exceeding 5 MiB', async () => {
      const httpServer = app.getHttpServer();
      const user = await registerAndLogin(
        httpServer,
        'uploader_large@test.com',
        'uploader_large',
        'password',
      );

      try {
        const res = await request(httpServer)
          .post('/files')
          .set('Authorization', `Bearer ${user.token}`)
          .attach('file', join(TEST_FIXTURES, 'large.bin'));
        expect([400, 413, 500]).toContain(res.status);
      } catch (err) {
        expect(String(err)).toMatch(/EPIPE|ECONNRESET|aborted|413|400/i);
      }
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
      const user = await registerAndLogin(
        httpServer,
        'approval2@test.com',
        'approval2',
        'password',
      );

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
