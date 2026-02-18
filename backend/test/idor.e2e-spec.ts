import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.2.2 — Identifier Trust Failures
 *
 * End-to-end tests proving IDOR (Insecure Direct Object Reference)
 * vulnerabilities across all resource endpoints. Every test demonstrates
 * that authentication (JwtAuthGuard) is enforced but authorization
 * (ownership checks) is entirely absent.
 *
 * CWE-639 (Authorization Bypass Through User-Controlled Key) | A01:2025
 * CWE-862 (Missing Authorization) | A01:2025
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

describe('IDOR — Identifier Trust Failures (v0.2.2)', () => {
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
   * IDOR: User B reads User A's file — CWE-639
   *
   * User A uploads a file (ownerId = A). User B, with a different JWT,
   * can read User A's file by knowing its ID. No ownership check.
   */
  it('User B can read User A\'s file — CWE-639 IDOR', async () => {
    const httpServer = app.getHttpServer();

    const userA = await registerAndLogin(httpServer, 'a@example.com', 'user-a', 'pass-a');
    const userB = await registerAndLogin(httpServer, 'b@example.com', 'user-b', 'pass-b');

    // User A uploads a file
    const uploadRes = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ filename: 'secret-doc.txt' })
      .expect(201);

    const fileId = uploadRes.body.id;
    expect(uploadRes.body.ownerId).toBe(userA.userId);

    // User B reads User A's file — should be forbidden but isn't (IDOR)
    const readRes = await request(httpServer)
      .get(`/files/${fileId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    expect(readRes.body.id).toBe(fileId);
    expect(readRes.body.ownerId).toBe(userA.userId);
    expect(readRes.body.filename).toBe('secret-doc.txt');
  });

  /**
   * IDOR: User B deletes User A's file — CWE-639
   */
  it('User B can delete User A\'s file — CWE-639 IDOR', async () => {
    const httpServer = app.getHttpServer();

    const userA = await registerAndLogin(httpServer, 'a@example.com', 'user-a', 'pass-a');
    const userB = await registerAndLogin(httpServer, 'b@example.com', 'user-b', 'pass-b');

    // User A uploads a file
    const uploadRes = await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ filename: 'private.pdf' })
      .expect(201);

    const fileId = uploadRes.body.id;

    // User B deletes User A's file — should be forbidden but isn't (IDOR)
    await request(httpServer)
      .delete(`/files/${fileId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);

    // User A can no longer find the file
    await request(httpServer)
      .get(`/files/${fileId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(404);
  });

  /**
   * IDOR: User B modifies User A's profile — CWE-639
   */
  it('User B can modify User A\'s profile — CWE-639 IDOR', async () => {
    const httpServer = app.getHttpServer();

    const userA = await registerAndLogin(httpServer, 'a@example.com', 'user-a', 'pass-a');
    const userB = await registerAndLogin(httpServer, 'b@example.com', 'user-b', 'pass-b');

    // User B changes User A's username — should be forbidden but isn't (IDOR)
    const updateRes = await request(httpServer)
      .put(`/users/${userA.userId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({ username: 'hacked-by-b' })
      .expect(200);

    expect(updateRes.body.username).toBe('hacked-by-b');

    // Confirm the change persisted
    const getRes = await request(httpServer)
      .get(`/users/${userA.userId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .expect(200);

    expect(getRes.body.username).toBe('hacked-by-b');
  });

  /**
   * Authentication enforced: unauthenticated requests return 401.
   */
  it('unauthenticated requests to resource endpoints return 401', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).get('/users').expect(401);
    await request(httpServer).get('/files/1').expect(401);
    await request(httpServer).get('/sharing').expect(401);
    await request(httpServer).get('/admin').expect(401);
  });
});
