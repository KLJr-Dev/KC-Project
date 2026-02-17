import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';

/**
 * v0.2.1 — Persisted Authentication
 *
 * End-to-end tests for /auth/* endpoints. Now runs against a real
 * PostgreSQL database (requires Docker PG running).
 *
 * Test infrastructure:
 *   - Each describe block creates a fresh NestJS app via beforeEach().
 *   - beforeEach() also truncates all tables via synchronize(true) to
 *     ensure test isolation — no leftover data between test blocks.
 *   - afterAll() closes the app and its DB connection.
 *   - supertest sends real HTTP requests to the app's HTTP server.
 *   - No mocking — tests hit the full stack (controller → service → PG).
 *
 * Requires: docker compose -f infra/compose.yml up -d
 */

/** Regex matching a valid JWT format (3 base64url segments separated by dots). */
const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

describe('AuthController /auth/register (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Truncate all tables for test isolation
    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Happy path: registration succeeds and returns a real JWT.
   */
  it('POST /auth/register returns 201 with a real JWT on success', async () => {
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
        token: expect.stringMatching(JWT_REGEX),
        message: expect.any(String),
      }),
    );
  });

  /**
   * Duplicate email returns 409 with a leaky message that includes the
   * email address. Confirms CWE-209 (information disclosure) is active.
   */
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

  /** Missing fields return 400 — basic input validation. */
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

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * Happy path: login with correct credentials returns a real JWT.
   */
  it('POST /auth/login returns 201 with a real JWT for valid credentials', async () => {
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
        token: expect.stringMatching(JWT_REGEX),
        message: expect.stringContaining('Login success'),
      }),
    );
  });

  /**
   * Non-existent email returns 401 with a distinct message.
   * Confirms CWE-204 (user enumeration via distinct error) is active.
   */
  it('POST /auth/login returns 401 for non-existent email', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
      .expect(401);

    expect(response.body.message).toContain('No user with that email');
  });

  /**
   * Wrong password returns 401 with a DIFFERENT distinct message.
   * Combined with the above test, this confirms user enumeration (CWE-204).
   */
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

  /** Missing fields return 400 — basic input validation. */
  it('POST /auth/login returns 400 when required fields are missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: '' })
      .expect(400);

    expect(response.body.message).toContain('Missing required login fields');
  });
});

describe('AuthController GET /auth/me (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * No Authorization header → 401. Confirms JwtAuthGuard rejects
   * unauthenticated requests.
   */
  it('GET /auth/me returns 401 when no Authorization header is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(response.body.message).toContain('Missing Authorization header');
  });

  /**
   * Garbage/invalid token → 401.
   */
  it('GET /auth/me returns 401 with an invalid/garbage token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer this-is-not-a-valid-jwt')
      .expect(401);

    expect(response.body.message).toContain('Invalid or expired token');
  });

  /**
   * Valid token → 200 with user profile. Full JWT session flow:
   *   register → login → receive JWT → use JWT on protected route → get profile
   */
  it('GET /auth/me returns 200 with user profile when a valid token is provided', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'me-test@example.com',
      username: 'me-user',
      password: 'mypassword',
    });

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'me-test@example.com', password: 'mypassword' })
      .expect(201);

    const token = loginRes.body.token;
    expect(token).toMatch(JWT_REGEX);

    const meRes = await request(httpServer)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: 'me-test@example.com',
        username: 'me-user',
      }),
    );

    expect(meRes.body).not.toHaveProperty('password');
  });
});

describe('AuthController POST /auth/logout (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * No Authorization header → 401.
   */
  it('POST /auth/logout returns 401 without Authorization header', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/logout')
      .expect(401);

    expect(response.body.message).toContain('Missing Authorization header');
  });

  /**
   * Valid token → 201 with success message.
   */
  it('POST /auth/logout returns 201 with valid token', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'logout-test@example.com',
      username: 'logout-user',
      password: 'password123',
    });

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'logout-test@example.com', password: 'password123' })
      .expect(201);

    const token = loginRes.body.token;

    const logoutRes = await request(httpServer)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(logoutRes.body.message).toContain('Logged out');
  });

  /**
   * TOKEN REPLAY AFTER LOGOUT — CWE-613.
   * Proves the JWT still works after logout.
   */
  it('token remains valid after logout — CWE-613 token replay', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'replay-test@example.com',
      username: 'replay-user',
      password: 'password123',
    });

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'replay-test@example.com', password: 'password123' })
      .expect(201);

    const token = loginRes.body.token;

    await request(httpServer)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    const meRes = await request(httpServer)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(meRes.body).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        email: 'replay-test@example.com',
        username: 'replay-user',
      }),
    );
  });
});

describe('Authentication Edge Cases (v0.1.5)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * BRUTE-FORCE TEST — CWE-307
   * 10 rapid wrong-password attempts, all return 401, none blocked.
   */
  it('allows unlimited rapid login attempts — CWE-307 brute force', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'brute-target@example.com',
      username: 'brute-target',
      password: 'correct-password',
    });

    for (let i = 0; i < 10; i++) {
      const res = await request(httpServer)
        .post('/auth/login')
        .send({ email: 'brute-target@example.com', password: `wrong-${i}` })
        .expect(401);

      expect(res.body.message).toContain('Incorrect password');
    }
  });

  /**
   * NO ACCOUNT LOCKOUT — CWE-307
   * After 10 failures, correct password still works.
   */
  it('account is never locked after failed attempts — CWE-307 no lockout', async () => {
    const httpServer = app.getHttpServer();

    await request(httpServer).post('/auth/register').send({
      email: 'lockout-target@example.com',
      username: 'lockout-target',
      password: 'real-password',
    });

    for (let i = 0; i < 10; i++) {
      await request(httpServer)
        .post('/auth/login')
        .send({ email: 'lockout-target@example.com', password: `wrong-${i}` })
        .expect(401);
    }

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'lockout-target@example.com', password: 'real-password' })
      .expect(201);

    expect(loginRes.body.token).toMatch(JWT_REGEX);
  });

  /**
   * WEAK PASSWORD ACCEPTED — CWE-521
   * Password "a" accepted for both register and login.
   */
  it('accepts single-character password — CWE-521 weak password', async () => {
    const httpServer = app.getHttpServer();

    const registerRes = await request(httpServer)
      .post('/auth/register')
      .send({
        email: 'weak-pw@example.com',
        username: 'weak-pw-user',
        password: 'a',
      })
      .expect(201);

    expect(registerRes.body.token).toMatch(JWT_REGEX);

    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'weak-pw@example.com', password: 'a' })
      .expect(201);

    expect(loginRes.body.token).toMatch(JWT_REGEX);
  });

  /**
   * USER ENUMERATION VIA DISTINCT ERRORS — CWE-204
   */
  it('distinct error messages reveal email registration status — CWE-204 enumeration', async () => {
    const httpServer = app.getHttpServer();
    const targetEmail = 'enum-test@example.com';

    const notRegistered = await request(httpServer)
      .post('/auth/login')
      .send({ email: targetEmail, password: 'anything' })
      .expect(401);

    expect(notRegistered.body.message).toContain('No user with that email');

    await request(httpServer).post('/auth/register').send({
      email: targetEmail,
      username: 'enum-user',
      password: 'secret',
    });

    const wrongPassword = await request(httpServer)
      .post('/auth/login')
      .send({ email: targetEmail, password: 'wrong' })
      .expect(401);

    expect(wrongPassword.body.message).toContain('Incorrect password');

    expect(notRegistered.body.message).not.toEqual(wrongPassword.body.message);
  });
});

/**
 * v0.2.1 — Persisted Authentication
 *
 * Proves that raw TypeORM / PostgreSQL errors leak to the client when an
 * unhandled database exception occurs. NestJS has no global exception filter
 * that sanitises these, so the full QueryFailedError (table name, constraint
 * name, SQL fragment) is returned in the 500 response body.
 *
 * CWE-209 (Generation of Error Message Containing Sensitive Information)
 */
describe('Verbose DB Errors (v0.2.1)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const dataSource = app.get(DataSource);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    await app.close();
  });

  /**
   * DUPLICATE PRIMARY KEY COLLISION — CWE-209 / CWE-532
   *
   * The ID strategy (`count + 1`) produces a collision after a deletion:
   *   1. Register user A → id="1"
   *   2. Register user B → id="2"
   *   3. Delete user A   → count drops to 1
   *   4. Register user C → count is 1, so id = "2" — collides with B
   *
   * NestJS's default ExceptionsHandler returns a generic 500 in the HTTP
   * response, but the raw QueryFailedError (including PG table name,
   * constraint name, and the full INSERT SQL with parameters) is logged
   * to stdout — a direct consequence of TypeORM `logging: true` (CWE-532).
   *
   * The 500 itself confirms a database-level failure to an attacker, and
   * the error is completely unhandled — no retry, no graceful fallback.
   */
  it('duplicate PK collision crashes request with unhandled 500 — CWE-209', async () => {
    const httpServer = app.getHttpServer();

    // Step 1 & 2: create two users (id="1", id="2")
    const regA = await request(httpServer).post('/auth/register').send({
      email: 'user-a@example.com',
      username: 'user-a',
      password: 'password123',
    });

    await request(httpServer).post('/auth/register').send({
      email: 'user-b@example.com',
      username: 'user-b',
      password: 'password123',
    });

    // Step 3: delete user A — count drops from 2 to 1
    // v0.2.2: /users now requires JWT, so send Bearer token
    await request(httpServer)
      .delete('/users/1')
      .set('Authorization', `Bearer ${regA.body.token}`)
      .expect(200);

    // Step 4: register user C — count() returns 1, so id = "2" → PK collision
    const response = await request(httpServer)
      .post('/auth/register')
      .send({
        email: 'user-c@example.com',
        username: 'user-c',
        password: 'password123',
      })
      .expect(500);

    // NestJS returns generic 500 — the raw PG error with table/constraint/SQL
    // details is logged to stdout (CWE-532), not in the response body
    expect(response.body.statusCode).toBe(500);
    expect(response.body.message).toBe('Internal server error');
  });
});
