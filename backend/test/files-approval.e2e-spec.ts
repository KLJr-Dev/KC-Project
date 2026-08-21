import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { setUserRole } from './e2e-app';

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
  async function registerUser(email: string, username: string, password = 'Password123!') {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password })
      .expect(201);

    return {
      userId: response.body.userId,
      token: response.body.token,
    };
  }

  async function registerAdmin(email = 'admin@example.com', username = 'admin') {
    const admin = await registerUser(email, username);
    await setUserRole(dataSource, admin.userId, 'admin');
    const adminToken = forgeJwt(admin.userId, email, 'admin');
    return { ...admin, token: adminToken };
  }

  /**
   * Helper: Promote a user to moderator or admin via admin endpoint
   */
  async function promoteUser(userId: string, role: 'moderator' | 'admin', adminToken: string) {
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
  function forgeJwt(userId: string, email: string, role: 'user' | 'moderator' | 'admin'): string {
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
    const admin = await registerAdmin();
    const user = await registerUser('user@example.com', 'regularuser');

    const promoted = await promoteUser(user.userId, 'moderator', admin.token);

    expect(promoted.role).toBe('moderator');

    // Verify JWT for moderator contains correct role
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'Password123!' })
      .expect(201);

    expect(loginRes.body.token).toMatch(JWT_REGEX);
    // Note: LoginDto doesn't return role, but database should have it
  });

  // ============================================================================
  // Test 2: File Approval by Moderator
  // ============================================================================
  it('Test 2: Moderator can approve files via PUT /files/:id/approve', async () => {
    const moderator = await registerUser('moderator@example.com', 'mod');
    const user = await registerUser('uploader@example.com', 'uploader');
    const admin = await registerAdmin('realadmin@example.com', 'admin');

    await promoteUser(moderator.userId, 'moderator', admin.token);
    const moderatorToken = forgeJwt(moderator.userId, 'moderator@example.com', 'moderator');

    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    const approveRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'approved' })
      .expect(200);

    expect(approveRes.body.approvalStatus).toBe('approved');
  });

  it('Test 3: Admin can also approve files', async () => {
    const admin = await registerAdmin();
    const user = await registerUser('uploader@example.com', 'uploader');

    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    const approveRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'approved' })
      .expect(200);

    expect(approveRes.body.approvalStatus).toBe('approved');
  });

  it('Test 4: Forged moderator JWT cannot approve files (DB role authoritative)', async () => {
    const user = await registerUser('regularuser@example.com', 'regular');
    const uploadRes = await uploadFile(user.token);
    const fileId = uploadRes.body.id;

    const forgedModeratorToken = forgeJwt(user.userId, 'regularuser@example.com', 'moderator');

    await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${forgedModeratorToken}`)
      .send({ status: 'approved' })
      .expect(403);

    const userRepo = dataSource.getRepository('User');
    const dbUser = await userRepo.findOne({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('user');
  });

  it('Test 5: Moderator and admin can both set approval status', async () => {
    const admin = await registerAdmin();
    const moderatorUser = await registerUser('mod@example.com', 'mod');
    await promoteUser(moderatorUser.userId, 'moderator', admin.token);

    const uploader = await registerUser('uploader@example.com', 'uploader');
    const uploadRes = await uploadFile(uploader.token);
    const fileId = uploadRes.body.id;

    const moderatorToken = forgeJwt(moderatorUser.userId, 'mod@example.com', 'moderator');

    await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'approved' })
      .expect(200);

    const rejectRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'rejected' })
      .expect(200);

    expect(rejectRes.body.approvalStatus).toBe('rejected');
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
    const admin = await registerAdmin();
    const moderator = await registerUser('mod@example.com', 'mod');
    await promoteUser(moderator.userId, 'moderator', admin.token);
    const moderatorToken = forgeJwt(moderator.userId, 'mod@example.com', 'moderator');

    const uploader = await registerUser('uploader@example.com', 'uploader');
    const uploadRes = await uploadFile(uploader.token);
    const fileId = uploadRes.body.id;

    const rejectRes = await request(app.getHttpServer())
      .put(`/files/${fileId}/approve`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .send({ status: 'rejected' })
      .expect(200);

    expect(rejectRes.body.approvalStatus).toBe('rejected');
  });
});
