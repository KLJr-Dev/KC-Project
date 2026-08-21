import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Escalation (v2.0.0) — admin-only promote to moderator; no moderator cascade.
 */
describe('PUT /admin/users/:id/role/escalate (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let adminToken: string;
  let moderatorToken: string;
  let userAId: string;
  let userBId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    jwtService = moduleFixture.get(JwtService);
    await dataSource.synchronize(true);

    const usersData = [
      { email: 'admin-esc@test.com', username: 'admin_esc', role: 'admin' },
      { email: 'mod-esc@test.com', username: 'mod_esc', role: 'moderator' },
      { email: 'userA@test.com', username: 'userA', role: 'user' },
      { email: 'userB@test.com', username: 'userB', role: 'user' },
    ];

    const userRepo = dataSource.getRepository('User');
    const now = new Date().toISOString();

    for (let i = 0; i < usersData.length; i++) {
      const userData = usersData[i];
      const user = await userRepo.save({
        ...userData,
        id: String(i + 1),
        password: 'plaintext',
        createdAt: now,
        updatedAt: now,
      });
      if (userData.role === 'admin') {
        adminToken = jwtService.sign({
          sub: user.id,
          email: user.email,
          role: 'admin',
        });
      } else if (userData.role === 'moderator') {
        moderatorToken = jwtService.sign({
          sub: user.id,
          email: user.email,
          role: 'moderator',
        });
      } else if (userData.username === 'userA') {
        userAId = user.id;
      } else if (userData.username === 'userB') {
        userBId = user.id;
      }
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('moderator cannot escalate (403)', async () => {
    await request(app.getHttpServer())
      .put(`/admin/users/${userAId}/role/escalate`)
      .set('Authorization', `Bearer ${moderatorToken}`)
      .expect(403);
  });

  it('admin can escalate user → moderator', async () => {
    const response = await request(app.getHttpServer())
      .put(`/admin/users/${userAId}/role/escalate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body.role).toBe('moderator');
    expect(response.body.id).toBe(userAId);
  });

  it('newly promoted moderator still cannot escalate others', async () => {
    await request(app.getHttpServer())
      .put(`/admin/users/${userAId}/role/escalate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const promotedToken = jwtService.sign({
      sub: userAId,
      email: 'userA@test.com',
      role: 'moderator',
    });

    await request(app.getHttpServer())
      .put(`/admin/users/${userBId}/role/escalate`)
      .set('Authorization', `Bearer ${promotedToken}`)
      .expect(403);
  });

  it('admin can read audit logs after escalate; moderator cannot', async () => {
    await request(app.getHttpServer())
      .put(`/admin/users/${userBId}/role/escalate`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);

    await request(app.getHttpServer())
      .get('/admin/audit-logs')
      .set('Authorization', `Bearer ${moderatorToken}`)
      .expect(403);
  });

  it('rejects escalation without token', async () => {
    await request(app.getHttpServer()).put(`/admin/users/${userAId}/role/escalate`).expect(401);
  });
});
