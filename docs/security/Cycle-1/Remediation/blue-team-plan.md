# Blue Team Plan — Cycle-1 → v2.0.0

**Branch:** `remediation/v2.0.0`  
**Inputs:** [v1.0.0-writeup.md](../PenTest/v1.0.0-writeup.md) · [v2.0.0-remediation.md](v2.0.0-remediation.md) · [security-baseline.md](../../../spec/security-baseline.md)  
**Do not:** “fix” evidence on `pentest/cycle-1` or weaken intentional vulns there.

---

## Mission

Ship a **secure parallel** of KC-Project (`v2.0.0`) that fails the Cycle-1 PoCs (IDOR, JWT forge, admin DELETE-as-user, open Swagger, published Postgres defaults, etc.) while keeping product journeys working for legitimate roles.

Success = baseline controls implemented + e2e/journey green under **secure** expectations + short verification note against each F-ID.

---

## Working agreements

| Rule | Practice |
|------|----------|
| One concern per PR | Prefer Wave A split into 2–3 PRs if reviews get large |
| Negative tests first | For each fix, add/adjust test that asserts **403/401/deny** |
| Flip vuln e2e | Suites that today *expect* forge/IDOR success must invert |
| Secrets | No new hardcoded JWT/DB passwords in repo; use env + `.env.example` placeholders |
| Demo UX | Allowed only behind explicit flag (`NEXT_PUBLIC_DEMO=1`) or non-prod |
| CTF later | v1.1.0 narrower vuln box is **out of scope** for this branch |

---

## Sprint board (implementation order)

### Wave A — P0 authz (do first)

Stops the three Critical/High kill chains: file IDOR, JWT admin, user DELETE.

| Ticket | Finding | Change | Files | Acceptance |
|--------|---------|--------|-------|------------|
| A1 | F-02 | Ownership on get / download / delete / list | `backend/src/files/files.service.ts`, `files.controller.ts` | `user` + file `9104` → **403**; own file **200** |
| A2 | F-10 | `@HasRole('admin')` on audit-logs + DELETE | `backend/src/admin/admin.controller.ts` | User JWT → both **403** |
| A3 | F-03 | `HasRoleGuard` loads role from **DB** by `sub` | `backend/src/auth/guards/has-role.guard.ts` (+ user repo) | Forged `role:admin` → admin routes **403** |
| A4 | F-03 / F-09 | Remove `kc-secret`; env secret; set access `expiresIn` | `auth.module.ts`, `auth.service.ts`, `infra/.env.example` | App boots with `JWT_SECRET`; expired token rejected |

**Suggested PR slice:** `A1` → `A2` → `A3+A4` (or A1+A2 together).

**Re-PoC after Wave A:**

```bash
# Expect denies (secure)
curl -sS -w "%{http_code}\n" -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/files/9104
curl -sS -w "%{http_code}\n" -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/admin/audit-logs
curl -sS -o /dev/null -w "%{http_code}\n" -X DELETE \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/admin/users/11
# Forged admin JWT must also fail HasRole once A3 lands
```

---

### Wave B — P0 infra + shares

| Ticket | Finding | Change | Files | Acceptance |
|--------|---------|--------|-------|------------|
| B1 | F-05 | Remove host `5433` publish on prod compose; strong DB password requirement | `infra/docker-compose.prod.yml`, `.env.example` | Host nmap: 5433 **closed**; stack healthy |
| B2 | F-04 | Random share tokens; enforce `expiresAt` | `sharing.service.ts`, `sharing.controller.ts`, seed migrations | Guessable `share-1` no longer works (or seed uses random + docs updated) |

---

### Wave C — P1 disclosure

| Ticket | Finding | Change | Files | Acceptance |
|--------|---------|--------|-------|------------|
| C1 | F-01 | Swagger only non-prod / flag | `backend/src/main.ts` | Prod `/api/docs` not public |
| C2 | F-11 / F-12 | Gate demo passwords + `/dev` | `frontend/lib/demo-users.ts`, `app/dev/**`, landing/auth/footer | Prod build has no plaintext demo passwords; `/dev` gated |
| C3 | F-08 / F-13 | Generic auth errors; strip version/CWE from client errors | `auth.service.ts`, guards, exception filter | Login errors identical; no `v0.1.x` in 401 bodies |

---

### Wave D — P2 baseline polish

| Ticket | Finding | Change | Files | Acceptance |
|--------|---------|--------|-------|------------|
| D1 | F-07 | CORS allowlist | `backend/src/main.ts` | `*` gone |
| D2 | F-06 | nginx security headers | `infra/nginx.conf` | CSP/XFO/nosniff (lab-appropriate) present |
| D3 | F-09 | Refresh tokens + logout revoke | auth + migration | Logout invalidates refresh; access TTL short |
| D4 | baseline | Path sanitize + MIME magic bytes | files upload path | Traversal / Content-Type trust reduced |

---

## Test plan (must track with code)

| Suite / script | Action on this branch |
|----------------|----------------------|
| `backend/test/rbac.e2e-spec.ts` | Forge → **deny** |
| `backend/test/inconsistency.e2e-spec.ts` | DELETE-as-user → **403** |
| `backend/test/files.e2e-spec.ts` | IDOR → **403**; token pattern update |
| `backend/test/escalation.e2e-spec.ts` | Align with admin-only escalation |
| `infra/smoke-test.sh` / `journey-test.sh` | Keep happy paths; add negative checks where cheap |
| `infra/e2e-docker.sh` | Green before tag `v2.0.0` |

Manual: re-run Critical/High rows from the pentest writeup Findings overview — all must fail open.

---

## Definition of Done (tag `v2.0.0`)

- [ ] Waves A–C complete (D3/D4 may slip only if explicitly accepted in remediation residual)
- [ ] Each F-01…F-13 marked remediated or accepted residual in [v2.0.0-remediation.md](v2.0.0-remediation.md)
- [ ] [security-baseline.md](../../../spec/security-baseline.md) authz / file ownership / infra exposure controls checked
- [ ] e2e-docker green
- [ ] Short “after” verification section appended to remediation report (commands + expected deny codes)
- [ ] `pentest/cycle-1` left intact as before-state evidence

---

## First coding session (start here)

1. Read `files.service.ts` get-by-id / download paths — add ownership assert (**A1**).
2. Add `@HasRole('admin')` to audit-logs + DELETE (**A2**) — smallest diff, fastest win.
3. Run targeted e2e / curl against running prod compose.
4. Then DB role check + JWT secret (**A3/A4**).

Do **not** start v1.1.0 CTF design until Wave A is merged.

---

## Status

| Item | State |
|------|-------|
| Pentest Cycle-1 | **Complete** (`pentest/cycle-1` @ handoff commit) |
| Remediation map | **Complete** |
| This plan | **Active** on `remediation/v2.0.0` |
| Code fixes | **Not started** — next: Wave A1/A2 |
