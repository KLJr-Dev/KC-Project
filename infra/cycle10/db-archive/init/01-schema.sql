-- CYCLE10-PLANT — stale archive schema (B4). LIVE rows seeded in B8.
CREATE TABLE IF NOT EXISTS employees (
  id          serial PRIMARY KEY,
  email       text NOT NULL,
  full_name   text NOT NULL,
  title       text,
  tag         text NOT NULL DEFAULT 'NOISE',
  notes       text
);

CREATE TABLE IF NOT EXISTS service_accounts (
  id          serial PRIMARY KEY,
  username    text NOT NULL,
  secret_hint text,
  tag         text NOT NULL DEFAULT 'NOISE',
  unlocks     text
);

INSERT INTO employees (email, full_name, title, tag, notes) VALUES
  ('noise1@northwind.lab', 'Noise One', 'Clerk', 'NOISE', 'ignore'),
  ('ops@northwind.lab', 'Ops Docs', 'Document Ops', 'LIVE', 'B8: mailbox cred path');

INSERT INTO service_accounts (username, secret_hint, tag, unlocks) VALUES
  ('sftp-vendor', 'see noise mail', 'NOISE', 'partner files only — no web skip'),
  ('docs-mail', 'B8 fills LIVE secret', 'LIVE', 'IMAP mail');
