import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.4.3 — File Approval & Ternary Roles (CWE-639 Extended, CWE-841, CWE-862)
 *
 * End-to-end tests for the file approval endpoint and ternary role system.
 * Demonstrates how role hierarchy ambiguity (moderator vs admin) and JWT forgery
 * can lead to unauthorized file approvals.
 *
 * Test infrastructure:
 *   - Each describe block creates a fresh NestJS app via beforeEach().
 *   - beforeEach() truncates tables for test isolation.
 *   - afterEach() closes the app.
 *   - Helper forgeJwt() creates tokens with arbitrary role claims
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe('File Approval & Ternary Roles (v0.4.3)', () => {
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
   * Helper: Promote a user to moderator or admin via admin endpoint
   */
  async function promoteUser(
    userId: string,
    role: 'moderator' | 'admin',
    adminToken: string,
  ) {
    const response = await request(app.getHttpServer())
      .put(`/admin/users/${userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role })
      .expect(200);

    return response.body;
  }

  /**
   * Helper: Forge a JWT with arbitrary role claim
   */
  function forgeJwt(
    userId: string,
    email: string,
    role: 'user' | 'moderator' | 'admin',
  ): string {
    return jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }

  /**
   * Helper: Upload a file as a user
   */
  async function uploadFile(token: string, filename = 'test.txt') {
    return await request(app.getHttpServer())
      .post('/files')
      .set('Authorization', `Bearer ${token}`)
      .field('description', 'Test file')
      .attach('file', Buffer.from('test content'), filename)
      .expect(201);
  }

  // ============================================================================
  // Test 1: Moderator Creation
  // ============================================================================
  it('Test 1: Can promote user to moderator via admin endpoint', async () => {
    // Create admin and regular user
    const admin = await registerUser('admin@example.com', 'admin');
    const adminToken = forgeJwt(admin.userId, 'admin@example.com', 'admin');

    const user = await registerUser('user@example.com', 'regularuser');

    // Promote user to moderator
    const promoted = await promoteUser(user.userId, 'moderator', adminToken);

    expect(promoted.role).toBe('moderator');

    // Verify JWT for moderator contains correct role
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'password123' })
      .expect(201);

    expect(loginRes.body.token).toMatch(JWT_REGEX);
    // Note: LoginDto doesn't return role, but database should have it
  });

  // ============================================================================
  // Test 2: File Approval by Moderator
  // ============================================================================
  it('Test 2: Moderator can approve files via PUT /files/:id/approve', async () => {
    // Create two users: moderator and regular
    const moderator = await registerUser('moderator@example.com', 'mod');
    const user = await registerUser('uploader@example.com', 'uploader');

    // Promote moderator
    const adminToken = forgeJwt('fake-admin-id', 'fake@example.com', 'admin');
    // Note: This will fail because fake admin doesn't exist, so let's use a different approach
    // Actually, let's create a legit admin user first
    const realAdmin = await registerUser('realadmin@example.com', 'admin');
    const realAdminToken = forgeJwt(
      realAdmin.userId,
      'realadmin@example.com',
      'admin',
    );

    await promoteUser(moderator.userId, 'moderator', realAdminToken);

    // Upload file as regular user
    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    // Approve file as moderator
    const approveRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ status: 'approved' })
      .expect(200);

    expect(approveRes.body.approvalStatus).toBe('approved');
  });

  // ============================================================================
  // Test 3: Admin Can Also Approve Files
  // ============================================================================
  it('Test 3: Admin can also approve files', async () => {
    // Create admin and regular user
    const admin = await registerUser('admin@example.com', 'admin');
    const user = await registerUser('uploader@example.com', 'uploader');

    // Create token with admin role for admin user
    const adminToken = forgeJwt(admin.userId, 'admin@example.com', 'admin');

    // Upload file as regular user
    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    // Approve file as admin
    const approveRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'approved' })
      .expect(200);

    expect(approveRes.body.approvalStatus).toBe('approved');
  });

  // ============================================================================
  // Test 4: Forged Moderator JWT Gains Access (CWE-639 Extended)
  // ============================================================================
  it('Test 4: VULN CWE-639 Extended: Forged moderator JWT approves files', async () => {
    // Create a regular user
    const user = await registerUser('regularuser@example.com', 'regular');

    // Upload a file
    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    // Forge a moderator JWT (user has role='user' in DB, but JWT claims 'moderator')
    const forgedModeratorToken = forgeJwt(
      user.userId,
      'regularuser@example.com',
      'moderator',
    );

    // Try to approve file with forged token
    // This should succeed because HasRole(['admin', 'moderator']) trusts JWT (CWE-639)
    const approveRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${forgedModeratorToken}`)
      .send({ status: 'approved' })
      .expect(200);

    expect(approveRes.body.approvalStatus).toBe('approved');

    // Proof: Database still shows user as 'user', not 'moderator'
    const userRepo = dataSource.getRepository('User');
    const dbUser = await userRepo.findOne({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('user');

    // But the file was approved anyway → CWE-639 extended
  });

  // ============================================================================
  // Test 5: Role Hierarchy Confusion - Moderator vs Admin
  // ============================================================================
  it('Test 5: Role Hierarchy Ambiguity: Moderator and admin can conflict', async () => {
    // Create moderator and admin
    const admin = await registerUser('admin@example.com', 'admin');
    const moderatorUser = await registerUser('mod@example.com', 'mod');

    const adminToken = forgeJwt(admin.userId, 'admin@example.com', 'admin');

    // Promote user to moderator
    await promoteUser(moderatorUser.userId, 'moderator', adminToken);

    // Create an uploader
    const uploader = await registerUser('uploader@example.com', 'uploader');

    // Upload a file
    const uploadRes = await uploadFile(uploader.token);
    const fileId = uploadRes.body.id;

    // Moderator approves
    await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderatorUser.token}`)
      .send({ status: 'approved' })
      .expect(200);

    // Admin rejects (override)
    const rejectRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'rejected' })
      .expect(200);

    expect(rejectRes.body.approvalStatus).toBe('rejected');

    // VULN: No conflict detection, no audit trail, no indication that moderator
    // already approved. This is CWE-841 (role hierarchy ambiguity).
    // In a real system, you'd want approval workflow states and audit logs.
  });

  // ============================================================================
  // Test 6: Unauthorized User Cannot Approve
  // ============================================================================
  it('Test 6: Regular user cannot approve files (403)', async () => {
    // Create two users
    const user1 = await registerUser('user1@example.com', 'user1');
    const user2 = await registerUser('user2@example.com', 'user2');

    // User1 uploads a file
    const uploadRes = await uploadFile(user1.token);
    const fileId = uploadRes.body.id;

    // User2 (regular, not moderator/admin) tries to approve
    await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${user2.token}`)
      .send({ status: 'approved' })
      .expect(403);
  });

  // ============================================================================
  // Bonus Test: File Rejection by Moderator
  // ============================================================================
  it('Bonus: Moderator can reject files', async () => {
    // Create moderator and uploader
    const realAdmin = await registerUser('admin@example.com', 'admin');
    const realAdminToken = forgeJwt(
      realAdmin.userId,
      'admin@example.com',
      'admin',
    );

    const moderator = await registerUser('mod@example.com', 'mod');
    await promoteUser(moderator.userId, 'moderator', realAdminToken);

    const uploader = await registerUser('uploader@example.com', 'uploader');

    // Upload file
    const uploadRes = await uploadFile(uploader.token);
    const fileId = uploadRes.body.id;

    // Moderator rejects
    const rejectRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderator.token}`)
      .send({ status: 'rejected' })
      .expect(200);

    expect(rejectRes.body.approvalStatus).toBe('rejected');
  });
});
