-- northwind_archive — HR / ops sample data (Blue tip: no credential loot)
-- Passwords are not stored here; archive DB auth uses POSTGRES_PASSWORD env/secret.

CREATE TABLE IF NOT EXISTS employees (
  id          serial PRIMARY KEY,
  email       text NOT NULL,
  full_name   text NOT NULL,
  title       text,
  department  text,
  notes       text
);

CREATE TABLE IF NOT EXISTS service_accounts (
  id          serial PRIMARY KEY,
  username    text NOT NULL,
  system_name text,
  notes       text
);

CREATE TABLE IF NOT EXISTS mailbox_exports (
  id          serial PRIMARY KEY,
  mailbox     text NOT NULL,
  subject     text NOT NULL,
  body        text NOT NULL,
  attached_as text
);

INSERT INTO employees (email, full_name, title, department, notes) VALUES
  ('j.miller@northwind.lab', 'Jordan Miller', 'Clerk', 'HR', 'HR export sample'),
  ('ops@northwind.lab', 'Document Operations', 'Document Ops', 'Document Ops', 'primary mailbox for packet handoff'),
  ('a.chen@northwind.lab', 'Avery Chen', 'Integration Engineer', 'Integration', 'cutover contact');

INSERT INTO service_accounts (username, system_name, notes) VALUES
  ('vendor', 'partners.northwind.lab', 'SFTP drop account — credentials via vault'),
  ('docs', 'mail.northwind.lab', 'ops mailbox — credentials via vault'),
  ('archive', 'db-archive.northwind.lab', 'restore role — credentials via env/secret');

INSERT INTO mailbox_exports (mailbox, subject, body, attached_as) VALUES
  (
    'ops@northwind.lab',
    'Q4 integration cutover — READ',
    E'Ops,\n\nCutover runbook is attached. Use vault-issued jump credentials — do not share passwords in mail.\n\n— Document Ops\n',
    'runbook-q4.txt'
  ),
  (
    'ops@northwind.lab',
    'runbook-q4.txt',
    E'Northwind Q4 Integration Runbook\n================================\n1. Confirm packet intake is green.\n2. Use vault-issued Samba credentials for the dept share (files.northwind.lab).\n3. SSH to integrate.northwind.lab with vault-issued operator credentials.\n4. Bastion access is from integrate only.\n',
    'runbook-q4.txt'
  ),
  (
    'it@northwind.lab',
    'password policy reminder',
    E'Reminder: MGMT and DATA secrets are rotated via vault. Do not paste passwords into mail or sticky notes.\n',
    NULL
  );
