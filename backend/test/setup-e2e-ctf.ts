/** CTF e2e setup — HS256 + CTF_MODE before AppModule loads. */
process.env.CTF_MODE = 'true';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-ctf-jwt-secret';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.CORS_ORIGINS =
  process.env.CORS_ORIGINS || 'http://127.0.0.1:8080,http://localhost:8080';
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5433';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
process.env.DB_NAME = process.env.DB_NAME || 'kc_prod';
delete process.env.JWT_PRIVATE_KEY_PATH;
delete process.env.JWT_PUBLIC_KEY_PATH;
