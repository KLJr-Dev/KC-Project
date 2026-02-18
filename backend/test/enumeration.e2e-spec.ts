import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.2.3 — Enumeration Surface
 *
 * End-to-end tests proving that sequential IDs, unbounded list endpoints,
 * publicly accessible Swagger spec, and response headers allow full
 * resource enumeration and API reconnaissance.
 *
 * CWE-200 (Exposure of Sensitive Information) | A01:2025
 * CWE-203 (Observable Discrepancy) | A01:2025
 * CWE-330 (Insufficiently Random Values) | A01:2025
 * CWE-400 (Uncontrolled Resource Consumption) | A06:2025
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

/** Helper: register + login, return { token, userId }. */
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

describe('Enumeration Surface (v0.2.3)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const config = new DocumentBuilder()
      .setTitle('KC-Project API')
      .setVersion('0.2.3')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Sequential ID probing: register 3 users, probe IDs 1-4.
   * 200 for existing, 404 for non-existing — attacker knows exact count.
   */
  it('sequential ID probing reveals resource existence — CWE-330, CWE-203', async () => {
    const httpServer = app.getHttpServer();

    const userA = await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');
    await registerAndLogin(httpServer, 'b@test.com', 'user-b', 'pass');
    await registerAndLogin(httpServer, 'c@test.com', 'user-c', 'pass');

    // Probe IDs 1, 2, 3 — all exist
    await request(httpServer)
      .get('/users/1')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);
    await request(httpServer)
      .get('/users/2')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);
    await request(httpServer)
      .get('/users/3')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    // Probe ID 4 — does not exist
    await request(httpServer)
      .get('/users/4')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(404);
  });

  /**
   * GET /users returns ALL users to any authenticated user — full table dump.
   */
  it('GET /users returns all users to any authenticated user — CWE-200', async () => {
    const httpServer = app.getHttpServer();

    await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');
    await registerAndLogin(httpServer, 'b@test.com', 'user-b', 'pass');
    await registerAndLogin(httpServer, 'c@test.com', 'user-c', 'pass');
    await registerAndLogin(httpServer, 'd@test.com', 'user-d', 'pass');
    const userE = await registerAndLogin(httpServer, 'e@test.com', 'user-e', 'pass');

    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${userE.token}`)
      .expect(200);

    expect(res.body).toHaveLength(5);
    expect(res.body.map((u: { username: string }) => u.username)).toEqual(
      expect.arrayContaining(['user-a', 'user-b', 'user-c', 'user-d', 'user-e']),
    );
  });

  /**
   * GET /files returns ALL files including other users' files with ownerIds.
   */
  it('GET /files returns all files to any authenticated user — CWE-200', async () => {
    const httpServer = app.getHttpServer();

    const userA = await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');
    const userB = await registerAndLogin(httpServer, 'b@test.com', 'user-b', 'pass');

    // User A uploads 2 files
    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ filename: 'a-secret.txt' })
      .expect(201);
    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ filename: 'a-report.pdf' })
      .expect(201);

    // User B uploads 1 file
    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ filename: 'b-notes.md' })
      .expect(201);

    // User B gets ALL files — including A's
    const res = await request(httpServer)
      .get('/files')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(res.body).toHaveLength(3);
    const ownerIds = res.body.map((f: { ownerId: string }) => f.ownerId);
    expect(ownerIds).toContain(userA.userId);
    expect(ownerIds).toContain(userB.userId);
  });

  /**
   * Swagger JSON spec is accessible without authentication.
   */
  it('Swagger spec accessible without authentication — CWE-200', async () => {
    const httpServer = app.getHttpServer();

    const res = await request(httpServer).get('/api/docs-json').expect(200);

    expect(res.body.openapi).toBeDefined();
    expect(res.body.paths).toBeDefined();
    expect(Object.keys(res.body.paths).length).toBeGreaterThan(0);
  });

  /**
   * X-Powered-By header reveals Express framework.
   */
  it('X-Powered-By header reveals Express framework — CWE-200', async () => {
    const httpServer = app.getHttpServer();

    const res = await request(httpServer).get('/ping').expect(200);

    expect(res.headers['x-powered-by']).toBe('Express');
  });

  /**
   * 200 vs 404 timing oracle: both return quickly but status code
   * difference confirms resource existence.
   */
  it('200 vs 404 status difference confirms resource existence — CWE-203', async () => {
    const httpServer = app.getHttpServer();

    const user = await registerAndLogin(httpServer, 'a@test.com', 'user-a', 'pass');

    const existsRes = await request(httpServer)
      .get('/users/1')
      .set('Authorization', `Bearer ${user.token}`);
    expect(existsRes.status).toBe(200);

    const missingRes = await request(httpServer)
      .get('/users/999')
      .set('Authorization', `Bearer ${user.token}`);
    expect(missingRes.status).toBe(404);

    // The status code difference is the oracle — no constant-time response
  });
});
