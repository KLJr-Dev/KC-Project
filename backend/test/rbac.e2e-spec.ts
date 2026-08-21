import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v2.0.0 — RBAC: JWT role forgery must fail; DB role is authoritative.
 */

const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe('RBAC & JWT Forgery (v2.0.0 secure)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let jwtService: JwtService;

  jest.setTimeout(60000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

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

  async function promoteToAdmin(userId: string) {
    const userRepo = dataSource.getRepository('User');
    await userRepo.update({ id: userId }, { role: 'admin' });
  }

  function forgeJwt(userId: string, email: string, role: 'user' | 'admin'): string {
    return jwtService.sign({
      sub: userId,
      email,
      role,
    });
  }

  it('forged JWT with role=admin is denied when DB role is user', async () => {
    const user = await registerUser('regular@example.com', 'regularuser');
    const forgedAdminToken = forgeJwt(user.userId, 'regular@example.com', 'admin');

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${forgedAdminToken}`)
      .expect(403);

    const userRepo = dataSource.getRepository('User');
    const dbUser = await userRepo.findOne({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('user');
  });

  it('Invalid/malformed JWT is rejected at JwtAuthGuard', async () => {
    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', 'Bearer not.a.valid.jwt')
      .expect(401);
  });

  it('Admin role change persists across login sessions', async () => {
    const bootstrap = await registerUser('bootstrap-admin@example.com', 'bootstrap');
    await promoteToAdmin(bootstrap.userId);
    const bootstrapLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'bootstrap-admin@example.com', password: 'Password123!' })
      .expect(201);
    const adminToken = bootstrapLogin.body.token;

    const user = await registerUser('persistent@example.com', 'persistentuser');

    const updateResponse = await request(app.getHttpServer())
      .put(`/admin/users/${user.userId}/role`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(updateResponse.body.role).toBe('admin');

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'persistent@example.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(loginResponse.body.token).toBeDefined();
    expect(loginResponse.body.token.match(JWT_REGEX)).toBeTruthy();

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .expect(200);
  });

  it('PUT /admin/users/:id/role rejects forged admin JWT', async () => {
    const user1 = await registerUser('user1@example.com', 'user1');
    const user2 = await registerUser('user2@example.com', 'user2');
    const forgedAdminToken = forgeJwt(user1.userId, 'user1@example.com', 'admin');

    await request(app.getHttpServer())
      .put(`/admin/users/${user2.userId}/role`)
      .set('Authorization', `Bearer ${forgedAdminToken}`)
      .send({ role: 'admin' })
      .expect(403);

    const userRepo = dataSource.getRepository('User');
    const updatedUser = await userRepo.findOne({ where: { id: user2.userId } });
    expect(updatedUser?.role).toBe('user');
  });

  it('forged invalid role claim is denied', async () => {
    const user = await registerUser('useronly@example.com', 'useronly');
    const invalidRoleToken = jwtService.sign({
      sub: user.userId,
      email: 'useronly@example.com',
      role: 'superadmin',
    });

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${invalidRoleToken}`)
      .expect(403);
  });

  it('real admin can modify any user role', async () => {
    const admin = await registerUser('admin@example.com', 'admin');
    await promoteToAdmin(admin.userId);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'Password123!' })
      .expect(201);

    const targetUser = await registerUser('target@example.com', 'target');

    const response = await request(app.getHttpServer())
      .put(`/admin/users/${targetUser.userId}/role`)
      .set('Authorization', `Bearer ${login.body.token}`)
      .send({ role: 'admin' })
      .expect(200);

    expect(response.body.id).toBe(targetUser.userId);
    expect(response.body.role).toBe('admin');
  });
});
