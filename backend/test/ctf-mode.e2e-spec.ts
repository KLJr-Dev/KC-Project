import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { AppModule } from '../src/app.module';

const FIXTURES = join(process.cwd(), 'test', 'fixtures');

/**
 * v1.1.0 CTF — intentional breaks when CTF_MODE=true (see setup-e2e-ctf.ts).
 */
describe('CTF mode breaks (v1.1.0)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let jwtService: JwtService;

  beforeAll(() => {
    if (!existsSync(FIXTURES)) mkdirSync(FIXTURES, { recursive: true });
    writeFileSync(join(FIXTURES, 'ctf-local.txt'), 'a1b2c3d4e5f60718293a4b5c6d7e8f90\n');
  });

  afterAll(() => {
    if (existsSync(FIXTURES)) rmSync(FIXTURES, { recursive: true });
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dataSource = app.get(DataSource);
    jwtService = app.get(JwtService);
    await dataSource.synchronize(true);
  });

  afterEach(async () => {
    if (app) await app.close();
  });

  async function registerUser(email: string, username: string) {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email, username, password: 'Password123!' })
      .expect(201);
    return { userId: res.body.userId, token: res.body.token };
  }

  it('allows cross-user file read (IDOR) when CTF_MODE is on', async () => {
    const userA = await registerUser('a@ctf.test', 'user-a');
    const userB = await registerUser('b@ctf.test', 'user-b');

    const upload = await request(app.getHttpServer())
      .post('/files')
      .set('Authorization', `Bearer ${userA.token}`)
      .attach('file', join(FIXTURES, 'ctf-local.txt'))
      .expect(201);

    await request(app.getHttpServer())
      .get(`/files/${upload.body.id}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .expect(200);
  });

  it('allows forged admin JWT when CTF_MODE trusts JWT role', async () => {
    const user = await registerUser('forge@ctf.test', 'forger');
    const forgedAdmin = jwtService.sign({
      sub: user.userId,
      email: 'forge@ctf.test',
      role: 'admin',
    });

    await request(app.getHttpServer())
      .get('/admin/users')
      .set('Authorization', `Bearer ${forgedAdmin}`)
      .expect(200);
  });
});
