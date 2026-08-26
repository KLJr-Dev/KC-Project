# Cycle-6 — locked decisions (P0 2026-08-26)

**Execution:** [v1.3.0-execution-plan.md](v1.3.0-execution-plan.md) · **Box:** [v1.3.0-box-plan.md](v1.3.0-box-plan.md) · **ADR-034**  
**Language:** prefer **product expansion cycle** / **feature lanes** / **Security SDL** — see [glossary](../../../glossary.md). Legacy docs may still say “SoftDev.”

**Docs branch:** `docs/cycle-6-p0` → PR into `main`. Do not land P0 by pushing to `main` directly.

---

## A. Packaging / versioning

| # | Topic | Locked |
|---|--------|--------|
| 1 | Ship shape | **Product expansion pair** **`v1.3.0`** (intentional insecure on `main`) → Red → **`v2.3.0`** (hardened) |
| 1b | Baseline tip | Secure **`v2.2.0`** (+ Cycle-5 Blue already merged) |
| 2 | Lanes | [ADR-015](../../../decisions/ADR-015-branching-strategy.md): reset `backend` / `frontend` / `dev` from `main` at **P1** (after P0 docs merge) |
| 3 | Docs / design | **Feature or docs branch** (`docs/cycle-6-p0`) → PR → `main` — never “drive” P0 on `main` |
| 4 | Archive | Tag `v1.3.0` → freeze `ctf/v1.3.0` for Red evidence |

```text
main @ v2.2.0 (secure tip)
  → docs/cycle-6-p0 (P0) → PR → main
  → reset feature lanes from main
  → backend + frontend → merge → dev → PR → main (intentional insecure)
  → pentest-ready → tag v1.3.0 → ctf/v1.3.0
  → Red (Socratic)
  → remediation/v2.3.0 → tag v2.3.0
```

---

## B. Product surfaces

| # | Topic | Locked |
|---|--------|--------|
| 5 | Primary feature | **Link Preview** — user supplies URL; **backend fetches** and returns title/snippet/body excerpt (intentional open fetch → **SSRF**, CWE-918 / FC-03) |
| 6 | CSRF plant | **`GET/POST /auth/bookmarks`** (cookie `kc_refresh`, **no** CSRF header). GET `/auth/bookmarks/save?url=` is the cross-site-friendly mutation (SameSite=Lax top-level). Graded proof `OS{…}` in JSON. Refresh keeps CSRF. |
| 7 | UX | Minimal product UI: enter URL → show preview; wire CSRF-relevant flow in frontend |
| 8 | Demo users | Keep existing `user@kc.test` / mod / admin seeds |

### API sketch (locked in P2)

- `POST /preview` — `{ "url": "…" }` → open server-side fetch (Bearer JWT)  
- `GET /internal/cycle6-flag` — SSRF prize body (F1)  
- `GET /auth/bookmarks/save?url=` · `POST /auth/bookmarks` · `GET /auth/bookmarks` — cookie session, **no** CSRF (F2 proof in JSON)

---

## C. Flags, decoys, non-goals

| # | Topic | Locked |
|---|--------|--------|
| 9 | Flags | **Two** graded `OS{32hex}` — F1 SSRF `OS{764e3877d12346b2f82978063872b4fe}` · F2 CSRF `OS{919efee8674b0ad10774bd5233c70d76}` (`cycle6-plants.ts`) |
| 10 | Useless `.env` | **Deferred** to Bucket B / later (OSCP-inspired). Optional near-zero-cost loopback decoy only if free during P2 — **not** required for `v1.3.0` DoD |
| 11 | Out | PrivEsc · docker escape · FTP · Notes XSS reprise · Cycle-5 `kc-agent` · AD/pivot · published `:5433` · remote MySQL from decoy creds |

---

## D. Pedagogy / Red coaching

| # | Topic | Locked |
|---|--------|--------|
| 12 | Brief | Progressive / OSCP-like hints; no GT spoilers |
| 13 | Coaching | **Socratic:** options + hypotheses; no copy-paste exploit dumps; GT sealed while player plays |
| 14 | Habit (optional) | 20-min rotate / spray-all from Portfolio OSCP methodology — coaching only |

---

## E. Security SDL (waterfall-shaped)

Aligned with [ADR-031](../../../decisions/ADR-031-security-cycle-docs.md):

1. Requirements & threat design → this folder + STRIDE  
2. Implementation → feature lanes  
3. Verification → smoke / journey / e2e  
4. Release insecure tip → `main` + tag `v1.3.0`  
5. PenTest → `Cycle-6/PenTest` + `ctf/v1.3.0`  
6. Remediation → tag `v2.3.0`

---

## F. Blue outcome (P7)

| # | Topic | Locked |
|---|--------|--------|
| 15 | Fetch harden | Allowlist / block loopback, link-local, cloud metadata; no open URL fetch on secure tip |
| 16 | CSRF | Restore CSRF (or equivalent) on the planted mutation |
| 17 | Tip UI version | Landing/footer show **`v2.3.0`** after Blue (P3 ships **`v1.3.0`** strings on insecure tip) |

---

## G. Tip UI version inventory (stale today)

Fix on **frontend lane (P3)**, not in P0 code:

| Location | Current | Target on `v1.3.0` ship |
|----------|---------|-------------------------|
| `frontend/app/page.tsx` | `v2.0.0 — Secure parallel` | `v1.3.0` intentional insecure wording |
| `frontend/app/components/footer.tsx` | `KC-Project v2.0.0` | `v1.3.0` |
| Comments in `frontend/lib/auth-context.tsx`, `access-token.ts` | M6 / v2.0.0 | Update if user-facing/misleading |

---

## H. Consumes / Bucket B

| ID | Status after P0 merge |
|----|------------------------|
| FC-02 CSRF | **In progress** (Cycle-6) |
| FC-03 SSRF | **In progress** (Cycle-6) |
| FC-17 useless config leak (OSCP-inspired) | **Available / later** |
| FC-18 LFI / config read | **Available / later** |

---

## Open for P3

- Frontend preview + bookmark UX  
- Player brief wording for SSRF target (loopback vs docker DNS)

P2 locks: CSRF = `/auth/bookmarks*`; SSRF prize = `GET /internal/cycle6-flag`; flags in `cycle6-plants.ts`.
