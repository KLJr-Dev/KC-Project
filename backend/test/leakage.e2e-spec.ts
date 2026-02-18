import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.2.4 — Error & Metadata Leakage
 *
 * End-to-end tests proving that unhandled exceptions, malformed input,
 * non-existent routes, and SQL logging leak implementation details.
 *
 * CWE-209 (Error Message Info Leak) | A10:2025
 * CWE-200 (Exposure of Sensitive Information) | A02:2025
 * CWE-532 (Sensitive Info in Logs) | A09:2025
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

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

describe('Error & Metadata Leakage (v0.2.4)', () => {
  let app: INestApplication<App>;

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
  });

  /**
   * GET /admin/crash-test throws a plain Error. NestJS returns a generic
   * 500 to the client, but the full stack trace (with file paths) leaks
   * to stdout.
   */
  it('runtime exception returns generic 500 — CWE-209, A10:2025', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');

    const res = await request(httpServer)
      .get('/admin/crash-test')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(500);

    expect(res.body.statusCode).toBe(500);
    expect(res.body.message).toBe('Internal server error');
    // Full stack trace with file paths appears in stdout (CWE-209)
  });

  /**
   * Malformed request body — no ValidationPipe means wrong types pass
   * through unchecked. The service may still handle it (TypeORM coerces),
   * but no input validation exists.
   */
  it('malformed request body accepted without validation — CWE-209', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');

    // Send number where string is expected — no ValidationPipe to reject it
    const res = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .send({ filename: 12345 });

    // Without ValidationPipe, the request is not rejected with 400.
    // It either succeeds (TypeORM coerces) or causes a 500 with stack trace in logs.
    expect([201, 500]).toContain(res.status);
  });

  /**
   * Non-existent route returns a 404 with NestJS-specific error shape,
   * revealing the framework's error format.
   */
  it('non-existent route returns 404 with NestJS signature — CWE-200', async () => {
    const httpServer = app.getHttpServer();

    const res = await request(httpServer).get('/nonexistent').expect(404);

    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toMatch(/Cannot GET \/nonexistent/);
  });

  /**
   * TypeORM SQL logging exposes full query details including plaintext
   * passwords in INSERT statements. This test registers a user — the
   * SQL with the plaintext password appears in stdout during the test run.
   */
  it('TypeORM SQL logging exposes query details — CWE-532', async () => {
    const httpServer = app.getHttpServer();

    // The act of registering logs the full INSERT including the password
    const res = await request(httpServer)
      .post('/auth/register')
      .send({ email: 'leak@test.com', username: 'leaker', password: 'my-secret-pass' })
      .expect(201);

    expect(res.body.token).toBeDefined();
    // stdout now contains: INSERT INTO "user"(...) VALUES (..., 'my-secret-pass', ...)
    // This is CWE-532 — sensitive info in logs
  });
});
