import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';
import { setUserRole } from './e2e-app';

const TEST_FIXTURES = join(process.cwd(), 'test', 'fixtures');
const STRONG = 'Password123!';

async function registerAndLogin(
  httpServer: App,
  email: string,
  username: string,
  password: string,
) {
  await request(httpServer).post('/auth/register').send({ email, username, password }).expect(201);
  const loginRes = await request(httpServer)
    .post('/auth/login')
    .send({ email, password })
    .expect(201);
  return { token: loginRes.body.token, userId: loginRes.body.userId };
}

describe('v0.5.2 — Pagination (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let dataSource: DataSource;

  beforeEach(async () => {
    if (!existsSync(TEST_FIXTURES)) mkdirSync(TEST_FIXTURES, { recursive: true });
    writeFileSync(join(TEST_FIXTURES, 'page.txt'), 'page test');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    jwtService = moduleFixture.get(JwtService);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: false,
      }),
    );
    app.useGlobalFilters(new ValidationExceptionFilter());
    await app.init();

    dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
    if (existsSync(TEST_FIXTURES)) rmSync(TEST_FIXTURES, { recursive: true });
  });

  it('GET /users returns paginated wrapper with defaults', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'p1@t.com', 'pageuser1', STRONG);
    await registerAndLogin(httpServer, 'p2@t.com', 'pageuser2', STRONG);
    await registerAndLogin(httpServer, 'p3@t.com', 'pageuser3', STRONG);

    const res = await request(httpServer)
      .get('/users')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body).toHaveProperty('items');
    expect(res.body).toHaveProperty('total', 3);
    expect(res.body).toHaveProperty('skip', 0);
    expect(res.body).toHaveProperty('take', 20);
    expect(res.body.items.length).toBe(3);
  });

  it('GET /users?skip=1&take=1 returns single page', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'pg1@t.com', 'pguser1', STRONG);
    await registerAndLogin(httpServer, 'pg2@t.com', 'pguser2', STRONG);

    const res = await request(httpServer)
      .get('/users?skip=1&take=1')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(2);
    expect(res.body.skip).toBe(1);
    expect(res.body.take).toBe(1);
  });

  it('GET /users?take=200 caps at max 100', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'cap@t.com', 'capuser', STRONG);

    const res = await request(httpServer)
      .get('/users?take=200')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body.take).toBe(100);
  });

  it('GET /files returns paginated items', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'fp@t.com', 'filepage', STRONG);

    await request(httpServer)
      .post('/files')
      .set('Authorization', `Bearer ${user.token}`)
      .attach('file', join(TEST_FIXTURES, 'page.txt'))
      .expect(201);

    const res = await request(httpServer)
      .get('/files?take=10')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(200);

    expect(res.body.items.length).toBe(1);
    expect(res.body.total).toBe(1);
  });

  it('GET /admin/users returns paginated admin list', async () => {
    const httpServer = app.getHttpServer();
    const admin = await registerAndLogin(httpServer, 'adm@t.com', 'adminpage', STRONG);
    await setUserRole(dataSource, admin.userId, 'admin');
    const adminToken = jwtService.sign({
      sub: admin.userId,
      email: 'adm@t.com',
      role: 'admin',
    });

    const res = await request(httpServer)
      .get('/admin/users?skip=0&take=5')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.items).toBeDefined();
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.skip).toBe(0);
    expect(res.body.take).toBe(5);
  });

  it('rejects invalid skip query param', async () => {
    const httpServer = app.getHttpServer();
    const user = await registerAndLogin(httpServer, 'inv@t.com', 'invalidskip', STRONG);

    await request(httpServer)
      .get('/users?skip=abc')
      .set('Authorization', `Bearer ${user.token}`)
      .expect(400);
  });
});
