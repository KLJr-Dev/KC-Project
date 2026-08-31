-- Northwind Intake seed (Cycle-9 SoftDev / v1.6.0 insecure tip).
-- Directory search stays parameterized (no SQLi plant).
-- CYCLE9-PLANT placeholders: real OS{32hex} filled in D4 / GT.
-- Insecure C8 replay: checkout ctf/v1.5.0 for SQLi plant seed.

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

-- CYCLE9-PLANT: onboarding / HR requests (sequential ids 9301+)
DROP TABLE IF EXISTS onboarding_requests CASCADE;
DROP SEQUENCE IF EXISTS onboarding_requests_id_seq;

CREATE SEQUENCE onboarding_requests_id_seq START WITH 9400;

CREATE TABLE onboarding_requests (
  id INTEGER PRIMARY KEY DEFAULT nextval('onboarding_requests_id_seq'),
  employee_email TEXT NOT NULL,
  department TEXT NOT NULL,
  national_id_last4 TEXT,
  manager_note TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  assignee_id TEXT,
  export_relpath TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER SEQUENCE onboarding_requests_id_seq OWNED BY onboarding_requests.id;

INSERT INTO onboarding_requests (
  id, employee_email, department, national_id_last4, manager_note,
  status, assignee_id, export_relpath, created_at
) VALUES
  -- L1 / F1 IDOR target — foreign assignee; lab-fake PII + flag placeholder
  (
    9301,
    'j.chen@northwind.ops',
    'HR',
    '4821',
    'CYCLE9-PLANT F1: clearance packet OS{TBA_F1} — do not share outside Onboarding',
    'pending',
    'hr-sarah-9001',
    NULL,
    NOW() - INTERVAL '3 days'
  ),
  -- L3 race target — pending; export package ready after approve
  (
    9302,
    'm.novak@northwind.ops',
    'Ops',
    '1190',
    'Badge + laptop kit pending manager sign-off',
    'pending',
    'hr-sarah-9001',
    'package.json',
    NOW() - INTERVAL '1 day'
  ),
  -- Pre-approved export row (traversal practice without race during SoftDev)
  (
    9303,
    'a.reid@northwind.ops',
    'Finance',
    '7744',
    'Approved offline — export package staged under /app/exports/9303/',
    'approved',
    'hr-mjones-9002',
    'package.json',
    NOW() - INTERVAL '12 hours'
  ),
  -- F2 via privilege_ack on mod/admin status PUT (not stored here — avoids IDOR skip)
  (
    9304,
    'k.owens@northwind.ops',
    'Legal',
    '3302',
    'Escalation packet reserved for mod queue — see status workflow',
    'pending',
    'mod-queue-9003',
    NULL,
    NOW() - INTERVAL '6 hours'
  ),
  -- Noise
  (
    9305,
    'p.diaz@northwind.ops',
    'Sales',
    '9012',
    'Welcome kit — standard path',
    'rejected',
    'hr-sarah-9001',
    NULL,
    NOW() - INTERVAL '5 days'
  );

SELECT setval(
  'onboarding_requests_id_seq',
  GREATEST((SELECT MAX(id) FROM onboarding_requests), 9399)
);

-- CYCLE9-PLANT: bolted-on SIEM / security events (F4 placeholder)
DROP TABLE IF EXISTS security_events CASCADE;

CREATE TABLE security_events (
  id SERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action TEXT NOT NULL,
  actor TEXT,
  detail TEXT
);

INSERT INTO security_events (ts, action, actor, detail) VALUES
  (NOW() - INTERVAL '2 hours', 'auth.login', 'user@kc.test', 'Login OK — session minted'),
  (NOW() - INTERVAL '90 minutes', 'intake.search', 'user@kc.test', 'q=lisa'),
  (
    NOW() - INTERVAL '45 minutes',
    'siem.ingest',
    'intake-monitor',
    'CYCLE9-PLANT F4 fragment: bearer eyJhbGciOi… leaked in shipper buffer OS{TBA_F4}'
  ),
  (NOW() - INTERVAL '20 minutes', 'onboarding.list', 'hr-sarah-9001', 'Listed open requests'),
  (NOW() - INTERVAL '5 minutes', 'health.probe', 'nginx', 'upstream intake reachability OK');
