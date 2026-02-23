import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.4.1 — Admin Endpoints & Weak Authorization Guards
 *
 * End-to-end tests for /admin/* endpoints. Tests verify the intentional
 * vulnerabilities (CWE-639, CWE-862, CWE-200, CWE-400) are present.
 *
 * Test infrastructure:
 *   - Each describe block creates a fresh NestJS app via beforeEach().
 *   - beforeEach() truncates tables for test isolation.
 *   - afterEach() closes the app.
 *   - supertest sends real HTTP requests against the running app.
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe('AdminController /admin/* (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Helper: Register a user and return { userId, token }
   */
  async function registerUser(
    email: string,
    username: string,
    password = 'password123',
  ) {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password })
      .expect(201);

    return {
      userId: response.body.userId,
      token: response.body.token,
    };
  }

  /**
   * Helper: Create an admin JWT token for a given user ID.
   * This simulates a user who has admin role in the JWT payload.
   */
  async function createAdminToken(userId: string): Promise<string> {
    return jwtService.sign({
      sub: userId,
      email: 'admin@test.com',
      role: 'admin',
    });
  }

  // ============================================================================
  // Test 1: Unauthenticated access (no JWT) → 401
  // ============================================================================
  it('GET /admin/users returns 401 when no JWT token provided', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .expect(401);
  });

  // ============================================================================
  // Test 2: Authenticated but non-admin → 403 (HasRoleGuard blocks)
  // ============================================================================
  it('GET /admin/users returns 403 when user is not admin (HasRoleGuard)', async () => {
    const { token } = await registerUser(
      'regular@example.com',
      'regularuser',
    );

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  // ============================================================================
  // Test 3: Admin can list all users (happy path) + CWE-200 email exposure
  // ============================================================================
  it('GET /admin/users returns 200 with all users when admin', async () => {
    const admin = await registerUser('admin@example.com', 'admin');
    const adminToken = await createAdminToken(admin.userId);

    // Register 3 other users so admin list has multiple entries
    await registerUser('user1@example.com', 'user1');
    await registerUser('user2@example.com', 'user2');
    await registerUser('user3@example.com', 'user3');

    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify response structure
    expect(response.body).toEqual(
      expect.objectContaining({
        users: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            email: expect.any(String),
            username: expect.any(String),
            role: expect.any(String),
          }),
        ]),
        count: expect.any(Number),
      }),
    );

    // Verify all emails are exposed (CWE-200)
    const emails = response.body.users.map((u: any) => u.email);
    expect(emails.length).toBeGreaterThanOrEqual(4);
  });

  // ============================================================================
  // Test 4: Unbounded list (CWE-400) — no pagination control
  // ============================================================================
  it('GET /admin/users returns all users without pagination limits (CWE-400)', async () => {
    const admin = await registerUser('admin@example.com', 'admin');
    const adminToken = await createAdminToken(admin.userId);

    // Register 10 users
    for (let i = 0; i < 10; i++) {
      await registerUser(`user${i}@example.com`, `user${i}`);
    }

    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // Verify no pagination — all 11 users returned (10 + 1 admin)
    expect(response.body.users).toHaveLength(11);
    expect(response.body.count).toBe(11);
  });

  // ============================================================================
  // Test 5: Update user role (happy path) — admin can change any user
  // ============================================================================
  it('PUT /admin/users/:id/role returns 200 when admin updates user role', async () => {
    const admin = await registerUser('admin@example.com', 'admin');
    const adminToken = await createAdminToken(admin.userId);

    const user = await registerUser('targetuser@example.com', 'targetuser');

    const response = await request(app.getHttpServer())
      .put(`/admin/users/${user.userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        id: user.userId,
        role: 'admin',
      }),
    );

    // Verify role was actually updated
    const userRepo = dataSource.getRepository('User');
    const updatedUser = await userRepo.findOne({ where: { id: user.userId } });
    expect(updatedUser?.role).toBe('admin');
  });

  // ============================================================================
  // Test 6: Non-admin cannot update roles → 403
  // ============================================================================
  it('PUT /admin/users/:id/role returns 403 when user is not admin', async () => {
    const user1 = await registerUser('user1@example.com', 'user1');
    const user2 = await registerUser('user2@example.com', 'user2');

    await request(app.getHttpServer())
      .put(`/admin/users/${user2.userId}/role`)
      .set('Authorization', `Bearer ${user1.token}`)
      .send({ role: 'admin' })
      .expect(403);
  });

  // ============================================================================
  // Test 7: Update non-existent user → 404
  // ============================================================================
  it('PUT /admin/users/:id/role returns 404 when user does not exist', async () => {
    const admin = await registerUser('admin@example.com', 'admin');
    const adminToken = await createAdminToken(admin.userId);

    await request(app.getHttpServer())
      .put(`/admin/users/nonexistent-id-12345/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(404);
  });

  // ============================================================================
  // Test 8: CWE-639 — JWT role trusted without DB re-validation
  // ============================================================================
  it('Admin access succeeds with JWT role alone (CWE-639: JWT trusted without DB re-check)', async () => {
    // Register a user
    const user = await registerUser('user@example.com', 'user');

    // Create an admin token for this user (JWT says admin, DB says user)
    // HasRoleGuard will trust the JWT role without checking DB
    const adminToken = await createAdminToken(user.userId);

    // This should succeed because HasRoleGuard trusts JWT (CWE-639)
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.users).toBeDefined();
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
