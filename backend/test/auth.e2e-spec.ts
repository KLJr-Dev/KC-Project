import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

/**
 * v0.1.3 — Session Concept (e2e tests)
 *
 * End-to-end tests for the /auth/* endpoints. Each describe block covers
 * one route. Tests exercise both happy paths and error paths, confirming
 * that intentional vulnerabilities behave as documented.
 *
 * Test infrastructure:
 *   - Each describe block creates a fresh NestJS app via beforeEach().
 *     This means the in-memory user store resets between test blocks
 *     (but NOT between individual tests within the same block — the
 *     store persists across tests sharing a beforeEach).
 *   - supertest sends real HTTP requests to the app's HTTP server.
 *   - No mocking — tests hit the full stack (controller → service → store).
 *
 * JWT format expectation:
 *   Tokens are now real JWTs (3 dot-separated base64url segments):
 *     header.payload.signature
 *   Regex: /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/
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
  });

  /**
   * Happy path: registration succeeds and returns a real JWT.
   * Confirms that JwtService.sign() is wired correctly and produces
   * a properly formatted token (not the old stub-token-{id} string).
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
  });

  /**
   * Happy path: login with correct credentials returns a real JWT.
   * Confirms the full flow: register → login → receive JWT.
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
   * Combined with the above test, this confirms user enumeration:
   * an attacker can distinguish "email not registered" from "email
   * registered but wrong password" (CWE-204).
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
  });

  /**
   * No Authorization header → 401. Confirms JwtAuthGuard rejects
   * unauthenticated requests before the controller handler runs.
   */
  it('GET /auth/me returns 401 when no Authorization header is provided', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .expect(401);

    expect(response.body.message).toContain('Missing Authorization header');
  });

  /**
   * Garbage/invalid token → 401. Confirms JwtAuthGuard rejects tokens
   * that fail signature verification. This is the baseline: even though
   * the secret is weak, you still need a validly signed token.
   */
  it('GET /auth/me returns 401 with an invalid/garbage token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer this-is-not-a-valid-jwt')
      .expect(401);

    expect(response.body.message).toContain('Invalid or expired token');
  });

  /**
   * Valid token from login → 200 with user profile. Proves the full
   * JWT session flow works end-to-end:
   *   register → login → receive JWT → use JWT on protected route → get profile
   *
   * Also confirms that the response contains the user's id, email, and
   * username (but NOT the password — UsersService.findById strips it).
   */
  it('GET /auth/me returns 200 with user profile when a valid token is provided', async () => {
    const httpServer = app.getHttpServer();

    // Register a user
    await request(httpServer).post('/auth/register').send({
      email: 'me-test@example.com',
      username: 'me-user',
      password: 'mypassword',
    });

    // Login to get a real JWT
    const loginRes = await request(httpServer)
      .post('/auth/login')
      .send({ email: 'me-test@example.com', password: 'mypassword' })
      .expect(201);

    const token = loginRes.body.token;
    expect(token).toMatch(JWT_REGEX);

    // Use the JWT to access the protected endpoint
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

    // Confirm password is NOT in the response
    expect(meRes.body).not.toHaveProperty('password');
  });
});

