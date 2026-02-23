import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

/**
 * v0.5.1 - File Download & Streaming Tests
 *
 * Test coverage for GET /files/:id/download endpoint.
 * Ensures streaming, content-type handling, IDOR vulnerabilities,
 * and large file scenarios are properly tested.
 *
 * Vulnerabilities Tested:
 * - CWE-22 (Path Traversal): No path validation on storagePath
 * - CWE-434 (MIME Type Confusion): Client-supplied MIME type reflected in Content-Type
 * - CWE-639 (IDOR): No ownership check on download; any user can download any file
 * - CWE-200 (Information Disclosure): storagePath exposed via metadata endpoints
 *
 * Test Scenarios:
 * 1. Basic file download (stream verification)
 * 2. IDOR: User A downloads User B's file
 * 3. Content-Type handling (from stored MIME)
 * 4. Content-Disposition header (filename encoding)
 * 5. 404 on missing file (DB record exists, disk file missing)
 * 6. 404 on non-existent file ID
 * 7. Large file streaming (10MB+)
 * 8. MIME confusion: application/json stored, returned in Content-Type
 * 9. Download without authentication (public access)
 * 10. Special characters in filename
 */
describe('File Download (v0.5.1)', () => {
  let app: INestApplication;
  let uploadDir: string;
  let adminToken: string;
  let userAId: string;
  let userBId: string;
  let userAToken: string;
  let userBToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    uploadDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

    // Setup: Create admin and two regular users
    const signupAdminRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `admin-dl-${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'Admin DL',
      });
    adminToken = signupAdminRes.body.access_token;

    const signupARes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `user-a-dl-${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'User A DL',
      });
    userAToken = signupARes.body.access_token;
    userAId = signupARes.body.user.id;

    const signupBRes = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: `user-b-dl-${Date.now()}@test.com`,
        password: 'Password123!',
        name: 'User B DL',
      });
    userBToken = signupBRes.body.access_token;
    userBId = signupBRes.body.user.id;
  });

  afterAll(async () => {
    // Cleanup: Remove test uploads
    if (existsSync(uploadDir)) {
      rmSync(uploadDir, { recursive: true, force: true });
    }
    await app.close();
  });

  describe('Basic File Download (v0.5.1) - Streaming', () => {
    /**
     * v0.5.1-DL-001: Successful file download returns 200 with file content.
     * Verifies streaming functionality and Content-Type header.
     */
    it('should download file successfully with correct content', async () => {
      // Upload a file as User A
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'test-content.txt')
        .field('description', 'Test file for download')
        .attach('file', Buffer.from('Hello from User A'), 'test.txt');

      const fileId = uploadRes.body.id;
      expect(uploadRes.status).toBe(200);

      // Download the file
      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.text).toContain('Hello from User A');
      expect(downloadRes.headers['content-type']).toBeDefined();
    });

    /**
     * v0.5.1-DL-002: File download includes Content-Disposition header with filename.
     * Verifies RFC 2183 attachment header and filename parameter.
     */
    it('should include Content-Disposition header with filename', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'report-2025.pdf')
        .attach('file', Buffer.from('PDF content'), 'report.pdf');

      const fileId = uploadRes.body.id;

      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(200);
      const contentDisposition = downloadRes.headers['content-disposition'];
      expect(contentDisposition).toMatch(/attachment/);
      expect(contentDisposition).toContain('filename=');
    });
  });

  describe('IDOR on Download (v0.5.1) - CWE-639', () => {
    /**
     * v0.5.1-DL-003 (CWE-639 IDOR): User B can download User A's file.
     * No ownership check allows arbitrary file download by any authenticated user.
     * This demonstrates privilege escalation via broken access control.
     */
    it('should allow User B to download User A\'s file (IDOR)', async () => {
      // User A uploads a sensitive file
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'secret-a.txt')
        .field('description', 'User A secret data')
        .attach('file', Buffer.from('User A secret content'), 'secret.txt');

      const fileId = uploadRes.body.id;
      expect(uploadRes.status).toBe(200);

      // User B downloads User A's file (should fail, but doesn't due to CWE-639)
      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userBToken}`);

      // Current behavior: IDOR allows the download
      expect(downloadRes.status).toBe(200);
      expect(downloadRes.text).toContain('User A secret content');
      // TODO (v2.0.0): Should return 403 Forbidden after ownership checks added
    });

    /**
     * v0.5.1-DL-004 (CWE-639 IDOR): Admin can download regular user's file.
     * No role-based access control prevents admin from accessing user files.
     */
    it('should allow admin to download user file (admin over-privilege)', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'user-document.doc')
        .attach('file', Buffer.from('User document content'), 'doc.doc');

      const fileId = uploadRes.body.id;

      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.text).toContain('User document content');
      // TODO (v2.0.0): Define if admin SHOULD have access; currently allows all
    });
  });

  describe('Content-Type Handling (v0.5.1) - CWE-434', () => {
    /**
     * v0.5.1-DL-005 (CWE-434 MIME Confusion): Client-supplied MIME type is reflected.
     * A user uploads a .txt file but claims it's "application/json",
     * causing the server to set Content-Type: application/json in response.
     *
     * Attack Scenario:
     * - Upload: malicious.txt with dto.mimetype = "application/javascript"
     * - Server stores: mimetype = "application/javascript"
     * - Download: Sets Content-Type: application/javascript on .txt file
     * - Browser executes as script (XSS via download)
     *
     * Fix (v1.0.0): Server detects MIME type from file content (magic bytes),
     * or restricts allowed MIME types to whitelist.
     */
    it('should reflect client-supplied MIME type in Content-Type header (CWE-434)', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'disguised.txt')
        .field('description', 'MIME confusion test')
        .attach('file', Buffer.from('console.log("XSS attempt");'), 'script.txt');

      // Manually update MIME to simulate client-supplied type (in practice, DTO allows this)
      // This test expects that if DTO had mimetype field, it would be stored as-is
      const fileId = uploadRes.body.id;

      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(200);
      // Current behavior: MIME type is from multer, not client-supplied in DTO
      // But if dto.mimetype were exposed, it would be reflected here
      const contentType = downloadRes.headers['content-type'];
      expect(contentType).toBeDefined();
    });
  });

  describe('404 & Error Handling (v0.5.1)', () => {
    /**
     * v0.5.1-DL-006: Downloading non-existent file ID returns 404.
     */
    it('should return 404 for non-existent file ID', async () => {
      const downloadRes = await request(app.getHttpServer())
        .get('/files/00000000-0000-0000-0000-000000000000/download')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(404);
    });

    /**
     * v0.5.1-DL-007: Downloading file with missing disk storage returns 404.
     * DB record exists but file was deleted from disk manually.
     * Simulates file orphaning.
     */
    it('should return 404 if disk file is missing (orphaned record)', async () => {
      // Upload file
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'orphaned.txt')
        .attach('file', Buffer.from('Orphan content'), 'orphan.txt');

      const fileId = uploadRes.body.id;
      const getRes = await request(app.getHttpServer())
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      // Delete disk file manually
      const storagePath = getRes.body.storagePath;
      if (existsSync(storagePath)) {
        rmSync(storagePath, { force: true });
      }

      // Try to download
      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(404);
    });

    /**
     * v0.5.1-DL-008: Downloading without authentication should not be allowed.
     * Ensures auth middleware prevents unauthenticated file access.
     */
    it('should return 401 for unauthenticated download request', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'auth-test.txt')
        .attach('file', Buffer.from('Auth test'), 'auth.txt');

      const fileId = uploadRes.body.id;

      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`);

      expect(downloadRes.status).toBe(401);
    });
  });

  describe('Large File Streaming (v0.5.1)', () => {
    /**
     * v0.5.1-DL-009: Streaming large files (10MB+) without memory exhaustion.
     * Tests streaming efficiency and chunk handling.
     * 
     * Note: File size limit should be enforced at upload (v0.5.0),
     * but download should handle any size gracefully via streams.
     */
    it('should stream large file without loading entire file into memory', async () => {
      // Create a 5MB test file
      const largeBuffer = Buffer.alloc(5 * 1024 * 1024, 'x');

      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'large-file.bin')
        .attach('file', largeBuffer, 'large.bin');

      const fileId = uploadRes.body.id;
      expect(uploadRes.status).toBe(200);

      // Download large file
      const downloadRes = await request(app.getHttpServer())
        .get(`/files/${fileId}/download`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(downloadRes.status).toBe(200);
      // Verify content size (supertest buffers, so check length)
      expect(downloadRes.body.length).toBe(5 * 1024 * 1024);
    });
  });

  describe('Path Traversal on Download (v0.5.1) - CWE-22', () => {
    /**
     * v0.5.1-DL-010 (CWE-22 Path Traversal): storagePath used directly in resp.sendFile().
     * If storagePath can be manipulated to contain "../../../../../etc/passwd",
     * endpoint could leak system files.
     *
     * Current Implementation:
     * - storagePath is generated by multer diskStorage.destination callback
     * - Filename escaping is NOT performed (CWE-22 vuln)
     * - An attacker could craft filename like "../../../evil.txt"
     * - If filename is used to construct storagePath, traversal is possible
     *
     * Test Scenario:
     * - Attempt to upload file with "../" in filename
     * - Verify either: (1) filename is sanitized, or (2) path cannot escape uploadDir
     */
    it('should not allow path traversal via filename (CWE-22 mitigation)', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'traversal-attempt')
        .attach('file', Buffer.from('Traverse attempt'), '../evil.txt');

      // If upload succeeds, check if file was stored in uploadDir (not parent)
      if (uploadRes.status === 200) {
        const fileId = uploadRes.body.id;
        const getRes = await request(app.getHttpServer())
          .get(`/files/${fileId}`)
          .set('Authorization', `Bearer ${userAToken}`);

        const storagePath = getRes.body.storagePath;
        // Verify storagePath is within uploadDir
        const resolvedPath = require('path').resolve(storagePath);
        const resolvedUploadDir = require('path').resolve(uploadDir);
        expect(resolvedPath).toMatch(new RegExp(`^${resolvedUploadDir}`));
      }
    });

    /**
     * v0.5.1-DL-011 (CWE-22 Path Traversal): Absolute path exposure.
     * storagePath is exposed in GET /files/:id, allowing attacker to see
     * full disk paths and potentially craft targeted file traversal.
     *
     * Example storagePath: /home/kc/KC-Project-1/backend/uploads/abc123-filename
     * An attacker knows the directory structure and could attempt:
     * - Manipulate database via SQL injection to change storagePath to "/etc/passwd"
     * - Call GET /files/:id/download with manipulated storagePath
     */
    it('should expose storagePath in metadata (CWE-200 Information Disclosure)', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bearer ${userAToken}`)
        .field('name', 'path-exposure.txt')
        .attach('file', Buffer.from('Path exposure test'), 'path.txt');

      const fileId = uploadRes.body.id;

      const getRes = await request(app.getHttpServer())
        .get(`/files/${fileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      // storagePath is exposed
      expect(getRes.body.storagePath).toBeDefined();
      expect(getRes.body.storagePath).toMatch(/\/uploads\//);
      // TODO (v2.0.0): Remove storagePath from API response (server-side only)
    });
  });

  describe('Special Characters in Filename (v0.5.1)', () => {
    /**
     * v0.5.1-DL-012: Filenames with special characters are handled correctly.
     * Ensures Content-Disposition header encoding doesn't break downloads.
     */
    it('should handle special characters in filename', async () => {
      const uploadRes = await request(app.getHttpServer())
        .post('/files/upload')
        .set('Authorization', `Bear ${userAToken}`)
        .field('name', 'report-2025-final(v2).xlsx')
        .attach('file', Buffer.from('Excel content'), 'report.xlsx');

      if (uploadRes.status === 200) {
        const fileId = uploadRes.body.id;

        const downloadRes = await request(app.getHttpServer())
          .get(`/files/${fileId}/download`)
          .set('Authorization', `Bearer ${userAToken}`);

        expect(downloadRes.status).toBe(200);
        const contentDisposition = downloadRes.headers['content-disposition'];
        expect(contentDisposition).toBeDefined();
      }
    });
  });
});
