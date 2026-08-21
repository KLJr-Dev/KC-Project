import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';

const TEST_FIXTURES = join(process.cwd(), 'test', 'fixtures');

function ensureFixtures() {
  if (!existsSync(TEST_FIXTURES)) mkdirSync(TEST_FIXTURES, { recursive: true });
  writeFileSync(join(TEST_FIXTURES, 'enum-a.txt'), 'a');
  writeFileSync(join(TEST_FIXTURES, 'enum-b.txt'), 'b');
  writeFileSync(join(TEST_FIXTURES, 'enum-c.txt'), 'c');
}

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

  beforeAll(() => {
    ensureFixtures();
  });

  afterAll(() => {
    if (existsSync(TEST_FIXTURES)) rmSync(TEST_FIXTURES, { recursive: true });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const config = new DocumentBuilder().setTitle('KC-Project API').setVersion('0.2.3').build();
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
  it('sequential ID probing reveals resource existence — accepted residual', async () => {
    const httpServer = app.getHttpServer();
    const STRONG = 'Password123!';

    const userA = await registerAndLogin(httpServer, 'a@test.com', 'user-a', STRONG);
    await registerAndLogin(httpServer, 'b@test.com', 'user-b', STRONG);
    await registerAndLogin(httpServer, 'c@test.com', 'user-c', STRONG);

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

    await request(httpServer)
      .get('/users/4')
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(404);
  });

  it('GET /users returns all users to any authenticated user (directory residual)', async () => {
    const httpServer = app.getHttpServer();
    const STRONG = 'Password123!';

    await registerAndLogin(httpServer, 'a@test.com', 'user-a', STRONG);
    await registerAndLogin(httpServer, 'b@test.com', 'user-b', STRONG);
    await registerAndLogin(httpServer, 'c@test.com', 'user-c', STRONG);
    await registerAndLogin(httpServer, 'd@test.com', 'user-d', STRONG);
    const userE = await registerAndLogin(httpServer, 'e@test.com', 'user-e', STRONG);

    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${userE.token}`)
      .expect(200);

    expect(res.body.items).toHaveLength(5);
    expect(res.body.total).toBe(5);
  });

  it('GET /files returns only caller-owned files', async () => {
    const httpServer = app.getHttpServer();
    const STRONG = 'Password123!';

    const userA = await registerAndLogin(httpServer, 'a@test.com', 'user-a', STRONG);
    const userB = await registerAndLogin(httpServer, 'b@test.com', 'user-b', STRONG);

    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'enum-a.txt'))
      .expect(201);
    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'enum-b.txt'))
      .expect(201);

    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userB.token}`)
      .attach('file', join(TEST_FIXTURES, 'enum-c.txt'))
      .expect(201);

    const res = await request(httpServer)
      .get('/files')
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].ownerId).toBe(userB.userId);
  });

  /**
   * When Swagger is mounted (non-prod / ENABLE_SWAGGER), docs-json is unauthenticated.
   * Production bootstrap skips SwaggerModule.setup (F-01).
   */
  it('Swagger spec accessible when mounted (lab only)', async () => {
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
