import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('AuthController /auth/register (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/register returns 201 with AuthResponseDto on success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'new-user@example.com',
        username: 'new-user',
        password: 'password123',
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        token: expect.stringContaining('stub-token-'),
        message: expect.any(String),
      }),
    );
  });

  it('POST /auth/register returns 409 on duplicate email', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'duplicate@example.com',
      username: 'first-user',
      password: 'password123',
    });

    const response = await request(httpServer)
      .post('/auth/register')
      .send({
        email: 'duplicate@example.com',
        username: 'second-user',
        password: 'password123',
      })
      .expect(409);

    expect(response.body.message).toContain('already exists');
  });

  it('POST /auth/register returns 400 when required fields are missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '',
        username: 'user-without-password',
      })
      .expect(400);

    expect(response.body.message).toContain('Missing required registration fields');
  });
});

describe('AuthController /auth/login (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('POST /auth/login returns 201 with valid credentials', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'login-test@example.com',
      username: 'login-user',
      password: 'secret123',
    });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'login-test@example.com', password: 'secret123' })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        userId: expect.any(String),
        token: expect.stringContaining('stub-token-'),
        message: expect.stringContaining('Login success'),
      }),
    );
  });

  it('POST /auth/login returns 401 for non-existent email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
      .expect(401);

    expect(response.body.message).toContain('No user with that email');
  });

  it('POST /auth/login returns 401 for wrong password', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'wrongpw@example.com',
      username: 'wrongpw-user',
      password: 'correct-password',
    });

    const response = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'wrongpw@example.com', password: 'wrong-password' })
      .expect(401);

    expect(response.body.message).toContain('Incorrect password');
  });

  it('POST /auth/login returns 400 when required fields are missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: '' })
      .expect(400);

    expect(response.body.message).toContain('Missing required login fields');
  });
});

