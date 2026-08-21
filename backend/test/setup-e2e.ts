import { join } from 'path';

process.env.JWT_PRIVATE_KEY_PATH =
  process.env.JWT_PRIVATE_KEY_PATH || join(__dirname, '../../infra/keys/jwt-private.pem');
process.env.JWT_PUBLIC_KEY_PATH =
  process.env.JWT_PUBLIC_KEY_PATH || join(__dirname, '../../infra/keys/jwt-public.pem');
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.CORS_ORIGINS =
  process.env.CORS_ORIGINS || 'http://127.0.0.1:8080,http://localhost:8080';
