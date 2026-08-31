import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

describe('v0.6.x Admin Polish (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  async function register(email: string, username: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password: 'Password123!' })
      .expect(201);
    return { userId: res.body.userId as string, token: res.body.token as string };
  }

  async function registerAdmin(email: string, username: string) {
    const user = await register(email, username);
    const dataSource = app.get(DataSource);
    await dataSource.query(`UPDATE "user" SET role = 'admin' WHERE id = $1`, [user.userId]);
    const token = jwtService.sign({
      sub: user.userId,
      email,
      role: 'admin',
    });
    return { userId: user.userId, token };
  }

  it('GET /admin/users?search= filters by email', async () => {
    const admin = await registerAdmin('admin-s@t.com', 'adminsearch');
    await register('findme@t.com', 'findable');
    await register('other@t.com', 'otheruser');

    const res = await request(app.getHttpServer())
      .get('/admin/users?search=findme')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].email).toBe('findme@t.com');
  });

  it('GET /admin/stats returns counts', async () => {
    const admin = await registerAdmin('stats@t.com', 'statsadmin');

    const res = await request(app.getHttpServer())
      .get('/admin/stats')
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    expect(res.body.userCount).toBeGreaterThanOrEqual(1);
    expect(res.body).toHaveProperty('fileCount');
    expect(res.body).toHaveProperty('shareCount');
    expect(res.body).toHaveProperty('storageBytesEstimate');
  });

  it('GET /ping is public; GET /health is gone', async () => {
    const ping = await request(app.getHttpServer()).get('/ping').expect(200);
    expect(ping.body.status).toBe('ok');
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});
