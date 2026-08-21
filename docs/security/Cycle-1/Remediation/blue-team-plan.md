# Blue Team Plan — Cycle 1 → v2.0.0

**Branch:** `remediation/v2.0.0`  
**Secure-ready gate:** [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md)  
**Finding → fix map:** [v2.0.0-remediation.md](v2.0.0-remediation.md)  
**Pentest evidence (frozen):** [v1.0.0-writeup.md](../PenTest/v1.0.0-writeup.md) on `pentest/cycle-1`  
**Control checklist:** [security-baseline.md](../../../spec/security-baseline.md)

| Field | Value |
|-------|-------|
| Cycle | 1 (ADR-013 / ADR-031) |
| From | v1.0.0 insecure MVP (pentest complete) |
| To | v2.0.0 secure parallel |
| Current milestone | **M0 complete** → next **M1 (Wave A)** |
| Code status | Not started |

---

## Mission

Ship a functionally equivalent **secure parallel** of KC-Project that **fails** Cycle-1 PoCs (file IDOR, JWT role forge, admin DELETE-as-user, open Swagger, published Postgres defaults, predictable shares, and supporting findings) while legitimate user / moderator / admin journeys still work.

**Success** = F-01…F-13 addressed · security-baseline authz/files/infra met · smoke / journey / e2e green under **deny** expectations · [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md) signed · tag `v2.0.0`.

---

## How this mirrors the path to v1.0.0

| v1.0.0 (build insecure) | v2.0.0 (harden) |
|-------------------------|-----------------|
| Phased versions toward freeze | Milestones **M0–M4** with exit gates |
| `smoke` / `journey` / `e2e-docker` | Same scripts + **negative** re-PoCs |
| [v1.0.0-pentest-ready.md](../../../release/v1.0.0-pentest-ready.md) | [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md) |
| Tag `v1.0.0` | Tag `v2.0.0` |

```text
v1.0.0 ──► pentest/cycle-1 (evidence frozen)
              │
              ▼
         remediation/v2.0.0
              │
     M0 docs ─► M1 authz ─► M2 infra ─► M3 disclosure ─► M4 baseline
                                                              │
                                                              ▼
                                                    secure-ready gate
                                                              │
                                                              ▼
                                                    merge main · tag v2.0.0
                                                              │
                                                              ▼
                                                    later: v1.1.0 CTF (fork secure)
```

---

## Working agreements

| Rule | Practice |
|------|----------|
| Freeze Red evidence | Do not “fix” vulns or rewrite PoCs on `pentest/cycle-1` |
| One milestone at a time | No skipping M1 for polish |
| Small PRs | Suggested slices under each milestone |
| Negative tests first | Assert **401/403/deny**; invert suites that today expect vuln success |
| Secrets | No new hardcoded JWT/DB passwords; env + `.env.example` placeholders only |
| Demo / `/dev` | Off in prod builds; optional `NEXT_PUBLIC_DEMO=1` for lab |
| CTF later | **v1.1.0** only after tag `v2.0.0` (ADR-013 fork-from-secure) |

---

## Defaults (locked)

| Topic | Decision |
|-------|----------|
| DoD | All pentest **F-01…F-13** + security-baseline authz / file ownership / infra exposure |
| JWT in M1 | Strong `JWT_SECRET` from env + access `expiresIn` + **HasRoleGuard reads DB role** |
| JWT in M4 | **RS256** + refresh tokens + logout revoke (baseline complete) |
| Demo UX | Prod compose: demos off; flag for non-prod lab |
| Share tokens | M2 replaces `share-N`; journeys/seeds updated |

---

## Milestone board

### M0 — Planning artifacts (docs)

| Deliverable | Path | Status |
|-------------|------|--------|
| This plan (milestones) | `Remediation/blue-team-plan.md` | **Done** |
| Finding → file map | `Remediation/v2.0.0-remediation.md` | **Done** (milestone column added) |
| Secure-ready gate scaffold | `docs/release/v2.0.0-secure-ready.md` | **Done** (checkboxes open until ship) |
| Cycle-1 + STRATEGY sync | Cycle-1 README, STRATEGY Phase 2/3 | **Done** |

**M0 exit:** Docs presentation-ready on `remediation/v2.0.0`. No application code required.

---

### M1 — Wave A (P0 authz)

Stops Critical/High kill chains: file IDOR, JWT admin, user DELETE.

| Ticket | Finding | Change | Primary files | Acceptance |
|--------|---------|--------|---------------|------------|
| A1 | F-02 | Ownership on get / download / delete / list | `backend/src/files/files.service.ts`, `files.controller.ts` | User + file `9104` → **403**; own file **200** |
| A2 | F-10 | `@HasRole('admin')` on audit-logs + DELETE | `backend/src/admin/admin.controller.ts` | User JWT → both **403** |
| A3 | F-03 | `HasRoleGuard` loads role from DB by `sub` | `backend/src/auth/guards/has-role.guard.ts` | Forged `role:admin` → admin routes **403** |
| A4 | F-03 / F-09 | Env `JWT_SECRET`; access `expiresIn`; remove `kc-secret` | `auth.module.ts`, `auth.service.ts`, `infra/.env.example` | Boots with env secret; expired token rejected |

**PR slices:** `A2` → `A1` → `A3+A4`.

**Test flips:** `backend/test/rbac.e2e-spec.ts`, `inconsistency.e2e-spec.ts`, `files.e2e-spec.ts`.

**Re-PoC (expect deny):**

```bash
curl -sS -w "%{http_code}\n" -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/files/9104
curl -sS -w "%{http_code}\n" -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/admin/audit-logs
curl -sS -o /dev/null -w "%{http_code}\n" -X DELETE \
  -H "Authorization: Bearer $USER_TOKEN" \
  http://127.0.0.1:8080/api/admin/users/11
```

**M1 exit:** Manual denies above · targeted e2e green · smoke green · matrix rows F-02, F-10, F-03 (DB role + secret), F-09 (`exp`) marked Verified (partial where noted).

---

### M2 — Wave B (P0 infra + shares)

| Ticket | Finding | Change | Primary files | Acceptance |
|--------|---------|--------|---------------|------------|
| B1 | F-05 | Unpublish host `5433`; strong DB password via env | `infra/docker-compose.prod.yml`, `.env.example` | Host nmap: 5433 **closed**; stack healthy |
| B2 | F-04 | Random share tokens; enforce `expiresAt` | `sharing.service.ts`, `sharing.controller.ts`, seeds | Guessable `share-1` fails; journeys updated |

**M2 exit:** F-04, F-05 verified · smoke/journey updated for new share contract.

---

### M3 — Wave C (P1 disclosure)

| Ticket | Finding | Change | Primary files | Acceptance |
|--------|---------|--------|---------------|------------|
| C1 | F-01 | Swagger only non-prod / explicit flag | `backend/src/main.ts` | Prod `/api/docs` not public |
| C2 | F-11 / F-12 | Gate demo passwords + `/dev` | `frontend/lib/demo-users.ts`, `app/dev/**`, landing/auth/footer | Prod build: no plaintext demos; `/dev` gated |
| C3 | F-08 / F-13 | Generic auth errors; strip version/CWE from clients | `auth.service.ts`, guards, exception filter | Identical login failures; no `v0.1.x` in 401 bodies |

**M3 exit:** F-01, F-08, F-11, F-12, F-13 verified.

---

### M4 — Wave D (baseline polish) + ship

| Ticket | Finding / control | Change | Primary files | Acceptance |
|--------|-------------------|--------|---------------|------------|
| D1 | F-07 | CORS allowlist | `backend/src/main.ts` | `Access-Control-Allow-Origin: *` gone |
| D2 | F-06 | nginx security headers | `infra/nginx.conf` | CSP / XFO / nosniff present (lab-appropriate) |
| D3 | F-09 + baseline | RS256 + refresh + logout revoke | auth module + migration | Logout invalidates refresh; short access TTL |
| D4 | baseline files | Path sanitize + MIME magic bytes | files upload path | Traversal / Content-Type trust reduced |

**Then:** complete every checkbox in [v2.0.0-secure-ready.md](../../../release/v2.0.0-secure-ready.md), append “After (v2.0.0)” to the remediation report, squash-merge to `main`, tag **`v2.0.0`**.

**M4 exit:** Secure-ready gate signed · e2e-docker green · tag created.

---

## Test plan

| Suite / script | Action on this branch |
|----------------|----------------------|
| `backend/test/rbac.e2e-spec.ts` | Forge → **deny** |
| `backend/test/inconsistency.e2e-spec.ts` | DELETE-as-user → **403** |
| `backend/test/files.e2e-spec.ts` | IDOR → **403**; share token pattern update |
| `backend/test/escalation.e2e-spec.ts` | Align with admin-only escalation |
| `infra/smoke-test.sh` | Happy path remains green |
| `infra/journey-test.sh` | Secure journeys (no intentional IDOR pass) |
| `infra/e2e-docker.sh` | Green before tag `v2.0.0` |

Manual: re-run Critical/High rows from the pentest Findings overview — all must **fail open**.

---

## Definition of Done (tag `v2.0.0`)

- [ ] M1–M3 complete; M4 complete or residuals explicitly accepted in remediation report
- [ ] Each F-01…F-13 **Verified** or **Accepted residual**
- [ ] security-baseline authz / ownership / infra exposure checked
- [ ] `v2.0.0-secure-ready.md` fully checked
- [ ] e2e-docker green
- [ ] `pentest/cycle-1` left intact as before-state evidence

---

## Next session

1. **M1 / A2** — add `@HasRole('admin')` to audit-logs + DELETE (smallest code win).  
2. **M1 / A1** — file ownership.  
3. **M1 / A3+A4** — DB role guard + env JWT + `expiresIn`.

Do not start v1.1.0 CTF design until M1 has landed.
