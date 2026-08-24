/**
 * Cycle-3 regression lock — secure path must fail the leak-crack-db writeup chain.
 *
 * Maps to PenTest on ctf/leak-crack-db:
 *   C3-F02 authenticated SQLi via GET /files?q= → must not exist (400 forbidNonWhitelisted)
 *   C3-F01/F03 plants + published PG are compose/migration concerns (assert-pg-unpublished.sh)
 *
 * No CTF_MODE helpers on this branch.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

const STRONG = 'Password123!';

describe('Cycle-3 regression — leak-crack-db chain must fail (secure)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  jest.setTimeout(60000);

  beforeAll(async () => {
    expect(process.env.CTF_MODE).not.toBe('true');

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  async function loginToken(): Promise<string> {
    const email = `c3-${Date.now()}@example.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username: `c3_${Date.now()}`, password: STRONG })
      .expect(201);
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: STRONG })
      .expect(201);
    return login.body.token as string;
  }

  it('C3-F02: GET /files?q= is rejected (no injectable search surface)', async () => {
    const token = await loginToken();
    const res = await request(app.getHttpServer())
      .get('/files')
      .query({ q: "' UNION SELECT 1--" })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toMatch(/7a8b9c0d1e2f30415263748596a7b8c9/);
  });

  it('C3-F02: GET /files without q still lists (pagination only)', async () => {
    const token = await loginToken();
    await request(app.getHttpServer())
      .get('/files')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('secure tree has no CTF_MODE module on disk (sanity)', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expect(() => require('../src/ctf/ctf-mode')).toThrow();
  });
});
