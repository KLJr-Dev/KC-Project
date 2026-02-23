import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Inconsistent Authorization E2E Tests (v0.4.5)
 *
 * CWE-862: Improper Access Control — Missing Authorization
 * CWE-639: Client-Controlled Authorization (JWT role trusted)
 *
 * Focus: Demonstrate inconsistent authorization enforcement across admin endpoints.
 *
 * Findings:
 * - GET /admin/users: Requires @HasRole('admin') — 403 for non-admin ✓ Secure
 * - PUT /admin/users/:id/role: Requires @HasRole('admin') — 403 for non-admin ✓ Secure
 * - PUT /admin/users/:id/role/escalate: Requires @HasRole(['moderator','admin']) — 403 for user ✓ Secure
 * - DELETE /admin/users/:id: ONLY @JwtAuthGuard — 204 for any auth user ✗ VULNERABLE (CWE-862)
 *
 * Attack Path:
 * 1. Regular user authenticates (JWT obtained)
 * 2. User calls DELETE /admin/users/:id on any target user
 * 3. HasRoleGuard sees no @HasRole metadata, allows access
 * 4. User successfully deletes other users without admin role
 * 5. File records orphaned (FilesEntity.userId no longer exists)
 */
describe('Admin Authorization Inconsistency (v0.4.5)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let moderatorToken: string;
  let userToken: string;
  let adminUserId: string;
  let moderatorUserId: string;
  let userAId: string;
  let userBId: string;

  const JWT_SECRET = 'kc-secret';

  function signJwt(payload: any): string {
    const crypto = require('crypto');
    const header = { alg: 'HS256', typ: 'JWT' };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const message = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(message)
      .digest('base64url');
    return `${message}.${signature}`;
  }

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.synchronize(true);

    // Create test users with different roles
    const usersData = [
      { email: 'admin-auth@test.com', username: 'admin_auth', role: 'admin' },
      { email: 'mod-auth@test.com', username: 'mod_auth', role: 'moderator' },
      { email: 'userA-auth@test.com', username: 'userA_auth', role: 'user' },
      { email: 'userB-auth@test.com', username: 'userB_auth', role: 'user' },
    ];

    const userRepo = dataSource.getRepository('User');

    for (const userData of usersData) {
      const user = await userRepo.save(userData);
      if (userData.role === 'admin') {
        adminUserId = user.id;
        adminToken = signJwt({
          sub: user.id,
          email: user.email,
          role: 'admin',
        });
      } else if (userData.role === 'moderator') {
        moderatorUserId = user.id;
        moderatorToken = signJwt({
          sub: user.id,
          email: user.email,
          role: 'moderator',
        });
      } else if (userData.username === 'userA_auth') {
        userAId = user.id;
        userToken = signJwt({
          sub: user.id,
          email: user.email,
          role: 'user',
        });
      } else if (userData.username === 'userB_auth') {
        userBId = user.id;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * Test 1: Missing Guard on DELETE endpoint
   * Any authenticated user can delete any other user (CWE-862)
   */
  describe('Test 1: Missing Authorization Guard on DELETE', () => {
    it('regular user should DELETE another user (vulnerability)', async () => {
      // User A (role='user') attempts to delete User B
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${userBId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204); // User gets deleted without error

      // Verify user is actually deleted by trying to fetch them
      const getUserResponse = await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const deletedUser = getUserResponse.body.users.find((u: any) => u.id === userBId);
      expect(deletedUser).toBeUndefined(); // User B is actually gone

      // CWE-862: Data point — successful deletion by non-admin
    });

    it('moderator should also be able to DELETE users', async () => {
      // Create a new user to delete
      const newUserData = { email: 'temp-user@test.com', username: 'temp_user', role: 'user' };
      const userRepo = dataSource.getRepository('User');
      const tempUser = await userRepo.save(newUserData);

      // Moderator attempts delete
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${tempUser.id}`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(204);

      // Verify deletion
      const getResponse = await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const verifyDeleted = getResponse.body.users.find((u: any) => u.id === tempUser.id);
      expect(verifyDeleted).toBeUndefined();

      // CWE-862: Moderator can delete, even though they lack explicit admin role
    });
  });

  /**
   * Test 2: Consistency Check — Other Endpoints Require Authorization
   * Compare DELETE behavior against other admin endpoints
   */
  describe('Test 2: Authorization Inconsistency Across Endpoints', () => {
    it('GET /admin/users should reject non-admin (403)', async () => {
      // User tries to list all users
      await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403); // Actually rejected

      // CWE-862 contrast: This guard works, but DELETE guard is missing
    });

    it('PUT /admin/users/:id/role should reject non-admin (403)', async () => {
      // Create a throwaway user to modify
      const newUserData = { email: 'throwaway1@test.com', username: 'throwaway1', role: 'user' };
      const userRepo = dataSource.getRepository('User');
      const throwawayUser = await userRepo.save(newUserData);

      // User tries to change role
      await request(app.getHttpServer())
        .put(`/admin/users/${throwawayUser.id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403); // Rejected as expected

      // CWE-862 contrast: Role change endpoint has guard, delete doesn't
    });

    it('DELETE /admin/users/:id should ALLOW non-admin (204)', async () => {
      // Create a throwaway user to delete
      const newUserData = { email: 'throwaway2@test.com', username: 'throwaway2', role: 'user' };
      const userRepo = dataSource.getRepository('User');
      const throwawayUser = await userRepo.save(newUserData);

      // User deletes (no guard!)
      await request(app.getHttpServer())
        .delete(`/admin/users/${throwawayUser.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204); // Allowed!

      // CWE-862: DELETE endpoint missing authorization check
    });
  });

  /**
   * Test 3: Privilege Escalation via Delete
   * Attacker can delete their superior (admin) to eliminate opposition
   */
  describe('Test 3: Lateral Escalation — Delete Superiors', () => {
    it('non-admin user should be able to delete admin user', async () => {
      // Create a new admin to delete
      const newAdminData = { email: 'target-admin@test.com', username: 'target_admin', role: 'admin' };
      const userRepo = dataSource.getRepository('User');
      const targetAdmin = await userRepo.save(newAdminData);

      // Regular user deletes the admin
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${targetAdmin.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(204);

      // Verify admin is gone
      const allUsers = await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const stillExists = allUsers.body.users.find((u: any) => u.id === targetAdmin.id);
      expect(stillExists).toBeUndefined();

      // CWE-862: Non-admin deleted admin, disrupting authorization model
    });
  });

  /**
   * Test 4: Unauthenticated requests still rejected
   * Only authentication is required, not authorization
   */
  describe('Test 4: Authentication Required (but not Authorization)', () => {
    it('should reject DELETE without token (401)', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${adminUserId}`)
        .expect(401);
    });

    it('should reject GET /admin/users without token (401)', async () => {
      await request(app.getHttpServer())
        .get(`/admin/users`)
        .expect(401);
    });
  });

  /**
   * Test 5: 404 handling (user doesn't exist)
   */
  describe('Test 5: Not Found Handling', () => {
    it('should return 404 for non-existent user deletion', async () => {
      const fakeId = '99999';
      await request(app.getHttpServer())
        .delete(`/admin/users/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });
  });
});
