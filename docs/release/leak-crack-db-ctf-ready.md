# leak-crack-db — CTF Box Ready Declaration

Formal gate: Cycle-3 OSCP-style CTF on branch **`ctf/leak-crack-db`** is **shipped, replayable, and frozen**.  
Product base remains tag **`v2.1.0`** (no version bump). Blue Team remediation is a **separate branch from `main`**.

---

## What this release is

| Field | Value |
|-------|--------|
| Product base | Tag `v2.1.0` |
| CTF branch | `ctf/leak-crack-db` (**frozen**) |
| Overlay | `infra/docker-compose.prod.yml` + `infra/docker-compose.ctf-leak.yml` |
| Proofs | 2 × 32-char hex (local / proof) |
| Style | OSCP identity + flag body |
| Red writeup | Complete — [PenTest/v1-leak-crack-db-writeup.md](../security/Cycle-3/PenTest/v1-leak-crack-db-writeup.md) |

---

## Surfaces

| Layer | Notes |
|-------|--------|
| HTTP `:8080` | nginx → Next + Nest `/api/*` |
| PostgreSQL `:5433` | Published on CTF overlay only; `ctf_ro` password after John |
| Intentional breaks | Behind `CTF_MODE=true` only (Files `q` SQLi + plants) |

No SSH/FTP sidecars. No Cycle-2 IDOR/JWT forge re-enable.

---

## Verification (operator)

```bash
git checkout ctf/leak-crack-db
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-leak.yml up -d --build
./infra/ctf-leak-examiner.sh
```

Confirm secure path (no overlay): Postgres not on `:5433`; `q` ignored without `CTF_MODE`.

---

## Portfolio artifacts

| Artifact | Path |
|----------|------|
| Cycle index | [Cycle-3/README.md](../security/Cycle-3/README.md) |
| Player brief | [Cycle-3/Dev/v1-leak-crack-db-player-brief.md](../security/Cycle-3/Dev/v1-leak-crack-db-player-brief.md) |
| Ground truth | [Cycle-3/Dev/v1-leak-crack-db-ground-truth.md](../security/Cycle-3/Dev/v1-leak-crack-db-ground-truth.md) |
| PenTest report | [Cycle-3/PenTest/v1-leak-crack-db-writeup.md](../security/Cycle-3/PenTest/v1-leak-crack-db-writeup.md) |
| Evidence | [Cycle-3/PenTest/screenshots/](../security/Cycle-3/PenTest/screenshots/) |
| Scope | [Cycle-3/PenTest/scope.md](../security/Cycle-3/PenTest/scope.md) |
| Blue fix map | [Cycle-3/Remediation/cycle-3-leak-crack-db-remediation.md](../security/Cycle-3/Remediation/cycle-3-leak-crack-db-remediation.md) |

---

## Gate checklist

- [x] Compose overlay publishes `:5433` + `CTF_MODE`
- [x] Seed: public share plant + `ctf_flags` + `ctf_ro` RLS
- [x] Files `q` string-concat under `CTF_MODE` only
- [x] My Files search UI wired to `q`
- [x] Player brief / ground truth / scope / Cycle-3 README
- [x] Examiner dry-run green (operator confirms on deploy)
- [x] Red Team writeup + evidence (2/2 proofs)
- [x] Without overlay: no published PG SQLi path
- [x] Remediation finding→fix stub + Blue plan
- [x] Branch frozen — do not remediate vulns on `ctf/leak-crack-db`

**Gate status: SHIPPED / FROZEN** — ready for Blue Team on `remediation/cycle-3-leak-crack-db` from `main`.

---

## Policy

- **`ctf/leak-crack-db` is frozen** as the replayable insecure box — do not remediate vulns on this branch.  
- **`main` stays secure** at `v2.1.0` until remediation merges (docs/fixes only; no CTF overlay).  
- Next harden: [blue-team-plan.md](../security/Cycle-3/Remediation/blue-team-plan.md).
