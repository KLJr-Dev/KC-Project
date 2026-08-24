/**
 * Cycle-2 regression lock (v2.1.0) — secure path must fail the CTF writeup chain.
 *
 * Maps to PenTest v1.1.0 walkthrough (ctf/v1.1.0):
 *   C2-F01 IDOR file get/download → 403
 *   C2-F02 forged JWT role:admin with DB role user → admin API 403
 *
 * Overlaps existing coverage in idor.e2e-spec.ts and rbac.e2e-spec.ts;
 * this suite names the Cycle-2 findings explicitly for the Blue Team gate.
 *
 * Host Postgres unpublished (C2-F03) is asserted in infra/smoke-test.sh
 * against docker-compose.prod.yml (not this Jest file).
 */
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';

const TEST_FIXTURES = join(process.cwd(), 'test', 'fixtures');

function ensureFixtures() {
  if (!existsSync(TEST_FIXTURES)) mkdirSync(TEST_FIXTURES, { recursive: true });
  writeFileSync(join(TEST_FIXTURES, 'c2-regression.txt'), 'cycle-2 flag body');
}

describe('Cycle-2 regression — CTF chain must fail (v2.1.0)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let jwtService: JwtService;

  jest.setTimeout(60000);

  beforeAll(async () => {
    ensureFixtures();
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
    if (existsSync(join(TEST_FIXTURES, 'c2-regression.txt'))) {
      rmSync(join(TEST_FIXTURES, 'c2-regression.txt'));
    }
  });

  async function registerUser(email: string, username: string, password = 'Password123!') {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password })
      .expect(201);
    return { userId: response.body.userId as string, token: response.body.token as string };
  }

  it('C2-F01: User B cannot get or download User A file (IDOR denied)', async () => {
    const http = app.getHttpServer();
    const userA = await registerUser('c2-a@example.com', 'c2_user_a');
    const userB = await registerUser('c2-b@example.com', 'c2_user_b');

    const uploadRes = await request(http)
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(TEST_FIXTURES, 'c2-regression.txt'))
      .expect(201);

    const fileId = uploadRes.body.id as string;

    await request(http)
      .get(`/files/${fileId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(403);

    await request(http)
      .get(`/files/${fileId}/download`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(403);
  });

  it('C2-F02: forged JWT role=admin denied when DB role is user', async () => {
    const user = await registerUser('c2-forge@example.com', 'c2_forge');
    const forged = jwtService.sign({
      sub: user.userId,
      email: 'c2-forge@example.com',
      role: 'admin',
    });

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${forged}`)
      .expect(403);

    const dbUser = await dataSource.getRepository('User').findOne({ where: { id: user.userId } });
    expect(dbUser?.role).toBe('user');
  });
});
