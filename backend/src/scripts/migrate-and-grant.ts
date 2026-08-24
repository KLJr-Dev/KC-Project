/**
 * v2.1.0 — Boot migrate as DB admin, then grant DML to runtime app role (C2-F07).
 *
 * Invoked from docker-entrypoint.sh before Nest starts as `kc_app`.
 * Idempotent: safe on every container start.
 */
import { DataSource } from 'typeorm';
import { join } from 'path';

function quoteIdent(name: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(name)) {
    throw new Error(`Refusing unsafe SQL identifier: ${name}`);
  }
  return `"${name}"`;
}

function sqlLiteral(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

async function main(): Promise<void> {
  const host = process.env.DB_HOST ?? 'localhost';
  const port = Number(process.env.DB_PORT ?? 5432);
  const database = process.env.DB_NAME ?? 'kc_prod';
  const adminUser = process.env.DB_ADMIN_USER ?? 'postgres';
  const adminPassword =
    process.env.DB_ADMIN_PASSWORD ?? process.env.DB_PASSWORD ?? 'postgres';
  const appUser = process.env.DB_USER ?? 'kc_app';
  const appPassword = process.env.DB_PASSWORD ?? '';

  const admin = new DataSource({
    type: 'postgres',
    host,
    port,
    username: adminUser,
    password: adminPassword,
    database,
    migrations: [join(__dirname, '..', 'migrations', '*{.js,.ts}')],
  });

  await admin.initialize();
  const executed = await admin.runMigrations();
  console.log(`[migrate-and-grant] migrations applied: ${executed.length}`);

  if (appUser === adminUser || appUser === 'postgres') {
    console.log(
      `[migrate-and-grant] DB_USER=${appUser} is admin; skipping app-role grants.`,
    );
    await admin.destroy();
    return;
  }

  if (!appPassword) {
    throw new Error('DB_PASSWORD required for app role when DB_USER is not admin');
  }

  const role = quoteIdent(appUser);
  await admin.query(`
DO $$
BEGIN
  CREATE ROLE ${role} LOGIN PASSWORD ${sqlLiteral(appPassword)};
EXCEPTION WHEN duplicate_object THEN
  ALTER ROLE ${role} WITH LOGIN PASSWORD ${sqlLiteral(appPassword)};
END
$$`);

  await admin.query(`GRANT CONNECT ON DATABASE ${quoteIdent(database)} TO ${role}`);
  await admin.query(`GRANT USAGE ON SCHEMA public TO ${role}`);
  await admin.query(
    `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${role}`,
  );
  await admin.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${role}`);
  await admin.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quoteIdent(adminUser)} IN SCHEMA public
     GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${role}`,
  );
  await admin.query(
    `ALTER DEFAULT PRIVILEGES FOR ROLE ${quoteIdent(adminUser)} IN SCHEMA public
     GRANT USAGE, SELECT ON SEQUENCES TO ${role}`,
  );
  await admin.query(`ALTER ROLE ${role} NOSUPERUSER NOCREATEDB NOCREATEROLE`);
  console.log(`[migrate-and-grant] granted DML on public to ${appUser}`);

  // Cycle-3 CTF: keep SELECT on ctf_flags for SQLi local path; strip writes if table exists.
  const flags = (await admin.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ctf_flags'`,
  )) as unknown[];
  if (flags.length > 0) {
    await admin.query(`REVOKE INSERT, UPDATE, DELETE ON TABLE "ctf_flags" FROM ${role}`);
    console.log(`[migrate-and-grant] revoked writes on ctf_flags from ${appUser}`);
  }

  await admin.destroy();
}

main().catch((err) => {
  console.error('[migrate-and-grant] failed', err);
  process.exit(1);
});
