import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

/**
 * Admin authorization consistency (v2.0.0)
 * DELETE and audit-logs require admin; non-admin → 403.
 * Tokens signed via app JwtService (RS256) so verification matches runtime.
 */
describe('Admin Authorization Consistency (v2.0.0)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let jwtService: JwtService;
  let adminToken: string;
  let moderatorToken: string;
  let userToken: string;
  let adminUserId: string;
  let userBId: string;

  let nextUserId = 5;

  function buildUser(partial: {
    email: string;
    username: string;
    role: 'user' | 'moderator' | 'admin';
  }) {
    const now = new Date().toISOString();
    return {
      ...partial,
      id: String(nextUserId++),
      password: 'plaintext',
      createdAt: now,
      updatedAt: now,
    };
  }

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
      { email: 'admin-auth@test.com', username: 'admin_auth', role: 'admin' as const },
      { email: 'mod-auth@test.com', username: 'mod_auth', role: 'moderator' as const },
      { email: 'userA-auth@test.com', username: 'userA_auth', role: 'user' as const },
      { email: 'userB-auth@test.com', username: 'userB_auth', role: 'user' as const },
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
        adminUserId = user.id;
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
      } else if (userData.username === 'userA_auth') {
        userToken = jwtService.sign({
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

  describe('DELETE requires admin', () => {
    it('unauthenticated DELETE returns 401', async () => {
      await request(app.getHttpServer()).delete(`/admin/users/${userBId}`).expect(401);
    });

    it('regular user cannot DELETE another user', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/${userBId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      const getUserResponse = await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const stillThere = (getUserResponse.body.items || getUserResponse.body).find(
        (u: { id: string }) => u.id === userBId,
      );
      expect(stillThere).toBeDefined();
    });

    it('moderator cannot DELETE users', async () => {
      const tempUser = await dataSource.getRepository('User').save(
        buildUser({
          email: 'temp-user@test.com',
          username: 'temp_user',
          role: 'user',
        }),
      );

      await request(app.getHttpServer())
        .delete(`/admin/users/${tempUser.id}`)
        .set('Authorization', `Bearer ${moderatorToken}`)
        .expect(403);
    });

    it('admin can DELETE a user', async () => {
      const tempUser = await dataSource.getRepository('User').save(
        buildUser({
          email: 'admin-deletes@test.com',
          username: 'admin_deletes',
          role: 'user',
        }),
      );

      await request(app.getHttpServer())
        .delete(`/admin/users/${tempUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);
    });
  });

  describe('Other admin endpoints', () => {
    it('GET /admin/users rejects non-admin (403)', async () => {
      await request(app.getHttpServer())
        .get(`/admin/users`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('GET /admin/audit-logs rejects non-admin (403)', async () => {
      await request(app.getHttpServer())
        .get(`/admin/audit-logs`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('PUT /admin/users/:id/role rejects non-admin (403)', async () => {
      const throwaway = await dataSource.getRepository('User').save(
        buildUser({
          email: 'throwaway1@test.com',
          username: 'throwaway1',
          role: 'user',
        }),
      );

      await request(app.getHttpServer())
        .put(`/admin/users/${throwaway.id}/role`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' })
        .expect(403);
    });
  });

  describe('Not found', () => {
    it('admin gets 404 for non-existent user deletion', async () => {
      await request(app.getHttpServer())
        .delete(`/admin/users/99999`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
