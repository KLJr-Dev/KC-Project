# CYCLE8-PLANT / CYCLE8-LEDGER — tip v1.5.0 seed for kc_intake
# L1: usernames for Hydra -L / VRFY universe
# L2: password_hash — exactly one lab-weak MD5 (lisa / sunshine) for John → SMTP later
#     All other hashes are uncrackable noise (D3) in lab time
# F1: notes on ops_flag row
# L3 FTP passwords are NOT here (Hydra target ≠ John secrets)
#
# Blue v2.5.0: drop weak MD5 / F1 plant; keep schema if feature retained.

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
  ('sarah',   'sarah@northwind.ops',   '5f4dcc3b5aa765d61d8327deb882cf99', 'HR',      'bcrypt-placeholder-noise'),
  ('nick',    'nick@northwind.ops',    'e10adc3949ba59abbe56e057f20f883e', 'Sales',   NULL),
  ('paul',    'paul@northwind.ops',    '25d55ad283aa400af464c76d713c07ad', 'IT',      NULL),
  ('linda',   'linda@northwind.ops',   '098f6bcd4621d373cade4e832627b4f6', 'Finance', NULL),
  ('joe',     'joe@northwind.ops',     '5e884898da28047151d0e56f8dc62927', 'Ops',     NULL),
  -- CYCLE8-LEDGER L2 LIVE: MD5(sunshine) — John target for SMTP (≠ FTP password)
  ('lisa',    'lisa@northwind.ops',    '0571749e2ac330a7455809c6b0e7af90', 'Ops',     'mailbox auth — lab weak'),
  ('nwops',   'nwops@northwind.ops',   'd8578edf8458ce06fbc5bb76a58c5ca4', 'Ops',     NULL),
  ('svc_intake', 'backup@northwind.ops',  '96e79218965eb72c92a549dd5a330112', 'IT',      NULL),
  ('ceo',     'ceo@northwind.ops',     '1a1dc91c907325c69271ddf0c944bc72', 'Exec',    NULL),
  ('aprice',  'aprice@northwind.ops',  'c33367701511b4f6020ec61ded352059', 'Legal',   NULL),
  ('mjones',  'mjones@northwind.ops',  '0cc175b9c0f1b6a831c399e269772661', 'HR',      NULL),
  ('rlee',    'rlee@northwind.ops',    '92eb5ffee6ae2fec3ad71c777531578f', 'Sales',   NULL),
  ('tkim',    'tkim@northwind.ops',    '4a8a08f09d37b73795649038408b5f33', 'IT',      NULL),
  ('admin',   'admin@northwind.ops',   '21232f297a57a5a743894a0e4a801fc3', 'IT',      'CYCLE8-DECOY — not SMTP LIVE'),
  -- F1 plant row (also discoverable via notes search / dump)
  ('ops_flag','flag@northwind.ops',    '00000000000000000000000000000000', 'Sec',     'OS{0036b6ceb86445a4c8dce300e4205c43}');
