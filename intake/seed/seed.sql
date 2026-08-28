-- Northwind Intake directory seed (secure tip v2.5.0 / kc_intake).
-- No graded flags, crackable hashes, or CTF ledger rows on the hardened tip.
-- Insecure replay: checkout ctf/v1.5.0 for plant seed.

CREATE TABLE IF NOT EXISTS mail_users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  department TEXT,
  notes TEXT
);

TRUNCATE mail_users RESTART IDENTITY;

INSERT INTO mail_users (username, email, password_hash, department, notes) VALUES
  ('sarah',      'sarah@northwind.ops',      'redacted', 'HR',      'Employee onboarding contact'),
  ('nick',       'nick@northwind.ops',       'redacted', 'Sales',   NULL),
  ('paul',       'paul@northwind.ops',       'redacted', 'IT',      NULL),
  ('linda',      'linda@northwind.ops',      'redacted', 'Finance', NULL),
  ('joe',        'joe@northwind.ops',        'redacted', 'Ops',     NULL),
  ('lisa',       'lisa@northwind.ops',       'redacted', 'Ops',     'Mailbox routing — use SSO'),
  ('nwops',      'nwops@northwind.ops',      'redacted', 'Ops',     NULL),
  ('svc_backup', 'backup@northwind.ops',     'redacted', 'IT',      'Service account — ticket required'),
  ('ceo',        'ceo@northwind.ops',        'redacted', 'Exec',    NULL),
  ('aprice',     'aprice@northwind.ops',     'redacted', 'Legal',   NULL),
  ('mjones',     'mjones@northwind.ops',     'redacted', 'HR',      NULL),
  ('rlee',       'rlee@northwind.ops',       'redacted', 'Sales',   NULL),
  ('tkim',       'tkim@northwind.ops',       'redacted', 'IT',      NULL);
