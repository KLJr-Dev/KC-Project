import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('v0.5.3 — Error Response Standardization (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
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
    app.useGlobalFilters(new ValidationExceptionFilter(), new HttpExceptionFilter());
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  it('returns 401 with unified shape for missing token', async () => {
    const res = await request(app.getHttpServer()).get('/users').expect(401);
    expect(res.body).toMatchObject({
      statusCode: 401,
      message: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(res.body.stack).toBeUndefined();
  });

  it('returns 404 with unified shape for unknown user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'err@t.com', username: 'erruser', password: 'pass' });
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'err@t.com', password: 'pass' });

    const res = await request(app.getHttpServer())
      .get('/users/99999')
      .set('Authorization', `Bearer ${login.body.token}`)
      .expect(404);

    expect(res.body.statusCode).toBe(404);
    expect(res.body.message).toBeDefined();
    expect(res.body.timestamp).toBeDefined();
    expect(res.body.stack).toBeUndefined();
  });
});
