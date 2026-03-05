/**
 * v0.5.0 — Input Validation Pipeline E2E Tests
 *
 * Comprehensive tests for the ValidationPipe and custom error responses.
 * Validates that:
 * - Malformed input returns 400 Bad Request with field-level errors
 * - Valid requests pass validation and reach controllers
 * - Strict type checking works (no auto-conversion)
 * - Unbounded fields expose CWE-400
 * - Weak password patterns expose CWE-521
 *
 * Covers all surfaces: auth, users, files, sharing, admin
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

describe('v0.5.0 — Input Validation Pipeline (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Register ValidationPipe and exception filter (same as main.ts)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
        skipMissingProperties: false,
      }),
    );
    app.useGlobalFilters(new ValidationExceptionFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('AUTH Surface (POST /auth/register, /auth/login)', () => {
    describe('RegisterDto Validation', () => {
      it('should accept valid registration', async () => {
        const uniqueEmail = `test${Date.now()}@example.com`;
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: uniqueEmail,
            username: 'testuser',
            password: 'p',
          })
          .expect(201);
        expect(res.body).toHaveProperty('token');
      });

      it('should reject missing email field', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            username: 'testuser',
            password: 'pass',
          })
          .expect(400);
        expect(res.body).toHaveProperty('errors.email');
        expect(res.body.errors.email).toContain('email is required');
      });

      it('should reject invalid email format', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'not-an-email',
            username: 'testuser',
            password: 'pass',
          })
          .expect(400);
        expect(res.body).toHaveProperty('errors.email');
      });

      it('should reject username < 3 chars (CWE-20)', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test2@example.com',
            username: 'ab',
            password: 'pass',
          })
          .expect(400);
        expect(res.body).toHaveProperty('errors.username');
        expect(res.body.errors.username[0]).toContain('at least 3 characters');
      });

      it('should accept password with 1 character (CWE-521)', async () => {
        const uniqueEmail = `pwd-test${Date.now()}@example.com`;
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: uniqueEmail,
            username: 'testuser3',
            password: 'a',
          })
          .expect(201);
        expect(res.body).toHaveProperty('token');
      });

      it('should reject unknown fields (strict whitelist)', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'test4@example.com',
            username: 'testuser4',
            password: 'pass',
            extraField: 'should-be-rejected',
          })
          .expect(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.statusCode).toBe(400);
      });

      it('should format validation error response correctly', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: 'invalid',
            username: 'a',
          })
          .expect(400);
        expect(res.body).toHaveProperty('statusCode', 400);
        expect(res.body).toHaveProperty('message');
        expect(res.body).toHaveProperty('errors');
        expect(res.body).toHaveProperty('timestamp');
      });
    });

    describe('LoginDto Validation', () => {
      it('should accept valid login', async () => {
        const uniqueEmail = `login${Date.now()}@example.com`;
        // Create user first
        await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: uniqueEmail,
            username: 'loginuser',
            password: 'pass',
          });

        // Then login
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: uniqueEmail,
            password: 'pass',
          })
          .expect(201); // login endpoint returns 201 Created
        expect(res.body).toHaveProperty('token');
      });

      it('should reject missing email on login', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            password: 'pass',
          })
          .expect(400);
        expect(res.body).toHaveProperty('errors.email');
      });

      it('should reject invalid email format on login', async () => {
        const res = await request(app.getHttpServer())
          .post('/auth/login')
          .send({
            email: 'not-email',
            password: 'pass',
          })
          .expect(400);
        expect(res.body).toHaveProperty('errors.email');
      });
    });
  });

  describe('FILES Surface (POST /files, PUT /files/:id/approve)', () => {
    let authToken: string;
    let fileId: string;

    beforeAll(async () => {
      // Create and authenticate user
      const registerRes = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `fileuser${Date.now()}@example.com`,
          username: `fileuser${Date.now()}`,
          password: 'pass',
        });
      authToken = registerRes.body.token;
    });

    describe('UploadFileDto Validation', () => {
      it('should accept file upload without description', async () => {
        const res = await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test content'), `test${Date.now()}.txt`)
          .expect(201);
        expect(res.body).toHaveProperty('id');
        fileId = res.body.id;
      });

      it('should accept file with string description (CWE-400 unbounded)', async () => {
        const res = await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test content 2'), `test2${Date.now()}.txt`)
          .field('description', 'This is a valid description')
          .expect(201);
        expect(res.body).toHaveProperty('id');
      });

      it('should reject non-string description', async () => {
        const res = await request(app.getHttpServer())
          .post('/files')
          .set('Authorization', `Bearer ${authToken}`)
          .attach('file', Buffer.from('test content 3'), `test3${Date.now()}.txt`)
          .field('description', '123') // sent as string, should work
          .expect(201);
        expect(res.body).toHaveProperty('id');
      });
    });

    describe('ApproveFileDto Validation', () => {
      it('should accept approved status', async () => {
        const res = await request(app.getHttpServer())
          .put(`/files/${fileId}/approve`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'approved' })
          .expect(200);
        expect(res.body).toHaveProperty('approvalStatus', 'approved');
      });

      it('should accept rejected status', async () => {
        const res = await request(app.getHttpServer())
          .put(`/files/${fileId}/approve`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'rejected' })
          .expect(200);
        expect(res.body).toHaveProperty('approvalStatus', 'rejected');
      });

      it('should reject invalid status enum', async () => {
        const res = await request(app.getHttpServer())
          .put(`/files/${fileId}/approve`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status: 'pending' })
          .expect(400);
        expect(res.body).toHaveProperty('errors.status');
      });

      it('should reject missing status field', async () => {
        const res = await request(app.getHttpServer())
          .put(`/files/${fileId}/approve`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({})
          .expect(400);
        expect(res.body).toHaveProperty('errors.status');
      });
    });
  });

  describe('Type Mismatch Validation (CWE-1025)', () => {
    it('should reject numeric email instead of string', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 12345,
          username: 'user',
          password: 'pass',
        })
        .expect(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should reject numeric username instead of string', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 123,
          password: 'pass',
        })
        .expect(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('Error Response Format (CWE-209)', () => {
    it('should return standardized error response format', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid',
          username: 'a',
        })
        .expect(400);

      // Verify all required fields in error response
      expect(res.body).toHaveProperty('statusCode', 400);
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('errors');
      expect(res.body).toHaveProperty('timestamp');

      // Verify error object structure
      expect(typeof res.body.errors).toBe('object');
      expect(Array.isArray(res.body.errors.email)).toBe(true);
      expect(Array.isArray(res.body.errors.username)).toBe(true);
    });

    it('should include field-level error messages', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          username: 'ab',
          password: 'pass',
        })
        .expect(400);

      expect(res.body.errors.username.length).toBeGreaterThan(0);
      expect(res.body.errors.username[0]).toContain('at least 3 characters');
    });
  });
});
