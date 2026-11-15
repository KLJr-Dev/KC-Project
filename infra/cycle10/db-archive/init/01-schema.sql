-- northwind_archive — stale HR / ops restore dump
-- Restored from tape 2025-09; passwords may be outdated.

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
  secret_hint text,
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
  ('j.miller@northwind.lab', 'Jordan Miller', 'Clerk', 'HR', 'legacy HR export'),
  ('ops@northwind.lab', 'Document Operations', 'Document Ops', 'Document Ops', 'primary mailbox for packet handoff'),
  ('a.chen@northwind.lab', 'Avery Chen', 'Integration Engineer', 'Integration', 'jump host contact — see mailbox_exports');

INSERT INTO service_accounts (username, secret_hint, system_name, notes) VALUES
  ('vendor', 'vendor', 'partners.northwind.lab', 'SFTP drop account'),
  ('docs', 'changeme', 'mail.northwind.lab', 'ops mailbox / docs account'),
  ('archive', 'postgres', 'db-archive.northwind.lab', 'postgres restore — default password still set');

INSERT INTO mailbox_exports (mailbox, subject, body, attached_as) VALUES
  (
    'ops@northwind.lab',
    'Q4 integration cutover — READ',
    E'Ops,\n\nCutover runbook is attached. Dept share has the jump-box note once you pull the runbook steps.\n\n— Document Ops\n',
    'runbook-q4.txt'
  ),
  (
    'ops@northwind.lab',
    'runbook-q4.txt',
    E'Northwind Q4 Integration Runbook\n================================\n1. Confirm packet intake is green.\n2. Pull integration material from the dept Samba share:\n   host: files.northwind.lab\n   share: dept\n   user: smbuser\n   pass: password\n   path: /integration/JUMPBOX.txt\n3. SSH to integrate.northwind.lab with the credentials in JUMPBOX.txt.\n4. Bastion access is from integrate only; ignore helpdesk sticky notes.\n',
    'runbook-q4.txt'
  ),
  (
    'it@northwind.lab',
    'bastion password reminder',
    E'Reminder from last rotation: bastion is Summer2024.\nPass along to anyone locked out of MGMT.\n',
    NULL
  );
