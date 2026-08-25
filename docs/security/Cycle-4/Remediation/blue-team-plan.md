# Blue Team plan — Cycle-4 → v2.2.0

**Branch:** `remediation/v2.2.0` (from `main` @ tag `v1.2.0` SoftDev tip)  
**Finding → fix map:** [v2.2.0-remediation.md](v2.2.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Secure-ready gate:** [v2.2.0-secure-ready.md](../../../release/v2.2.0-secure-ready.md)  
**Red evidence (frozen):** branch `ctf/v1.2.0` · tag `v1.2.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.2.0/docs/security/Cycle-4/PenTest/v1.2.0-writeup.md)  
**ADR:** [ADR-033](../../../decisions/ADR-033-cycle-4-softdev-version-pair.md)

| Field | Value |
|-------|-------|
| Cycle | 4 (SoftDev security pair) |
| From | Intentional insecure Notes + SSH overlay on `main` (`v1.2.0`) |
| To | Tag **`v2.2.0`** — Notes kept; XSS closed; no default SSH |
| Current milestone | **M0 done** — plan committed; **M1** next |
| Code status | Plan only — implementation pending |

```text
main @ v1.2.0 (insecure SoftDev)
  ──► remediation/v2.2.0 ──► PR main ──► tag v2.2.0
         ▲
ctf/v1.2.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close the Cycle-4 Red chain on the **product tip**: Notes remain a first-class feature, but **stored XSS and inline attachment candy die**, and **live bastion secrets leave the app**. SoftDev SSH stays an **optional overlay only** (never implied by default prod compose). Tag **`v2.2.0`** so CTF-only / Cycle-5 work can fork a secure baseline again.

**Success** = C4-F01…F03 Verified or Accepted · regression e2e green · asserts green · [v2.2.0-secure-ready.md](../../../release/v2.2.0-secure-ready.md) signed · merge → tag `v2.2.0` · `ctf/v1.2.0` intact.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + residuals + secure-ready scaffold | **Done** |
| **M1** | Wave A — XSS + attachments | Safe Notes render; no `unsafe-markdown` sink; attachment not inline SVG/HTML XSS | Pending |
| **M2** | Wave B — seeds + SSH story | No live `lab`/`labpass` in product notes; Cycle-4 plants removed or neutralized on secure tip; docs say SSH overlay is lab-only | Pending |
| **M3** | Wave C — regression + asserts | Notes XSS negative e2e; user 403 on foreign notes; `assert-ssh-unpublished` / `assert-pg-unpublished` in gate | Pending |
| **M4** | Wave D — gate + tag | Secure-ready signed; smoke + journey + e2e-docker (+ tls-smoke if policy); PR → `main` → tag `v2.2.0`; SoftDev rails reset | Pending |

### M0 — Plan

- [x] Branch `remediation/v2.2.0` from `main`
- [x] [v2.2.0-remediation.md](v2.2.0-remediation.md) finding → fix map
- [x] [accepted-residuals.md](accepted-residuals.md)
- [x] [v2.2.0-secure-ready.md](../../../release/v2.2.0-secure-ready.md) scaffold
- [x] Cross-links from Cycle-4 README / Remediation index

### M1 — XSS + attachments (must-close)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C4-F01 | Escape / sanitize note body; remove or replace `unsafeMarkdownToHtml`; no `dangerouslySetInnerHTML` of attacker HTML | `frontend/app/notes/[id]/page.tsx`, `frontend/lib/unsafe-markdown.ts` |
| C4-F01 (attach) | Serve attachments as download (or safe MIME allowlist); never `inline` for `image/svg+xml` / `text/html` on secure tip | `backend` notes upload + attachment route |

### M2 — Secrets out of product data

| Finding | Fix intent |
|---------|------------|
| C4-F02 | Strip SeedDemoNotes Cycle-4 SSH plant / flags from **secure** seeds (or replace with non-secret placeholders). GT/flags remain on `ctf/v1.2.0` only. |
| C4-F03 | Keep `docker-compose.ssh.yml` for **lab replay of v1.2.0** only; README / secure-ready: default `prod` alone must not publish `:2222`. Do not ship weak SSH as a product feature on `v2.2.0`. |

### M3 — Prove the chain fails

- [ ] e2e: stored `img onerror` / script body does **not** execute (or is escaped in DOM)
- [ ] e2e: user cannot `GET /notes/:foreignId` (already true — keep named)
- [ ] Optional: admin note bodies on secure tip contain no `labpass` / `OS{` Cycle-4 plants
- [ ] `./infra/assert-ssh-unpublished.sh` + `assert-pg-unpublished.sh` in gate path

### M4 — Ship

- [ ] Fill + sign secure-ready
- [ ] smoke · journey · e2e-docker · tls-smoke (LAN policy unchanged)
- [ ] PR `remediation/v2.2.0` → `main`
- [ ] Tag `v2.2.0` · freeze this branch · reset `backend`/`frontend`/`dev` to `main`

---

## Disposition lock (M0)

| ID | Disposition |
|----|-------------|
| C4-F01 | **Must-close** |
| C4-F02 | **Must-close** on product tip (plants stay on CTF archive) |
| C4-F03 | **Accepted residual + policy** — overlay may exist for teaching; default prod = no SSH |
| C4-F04 | **Accepted residual (lab)** — demo passwords documented; optional harden later / Bucket B |
| C4-F05 | Info — decoys intentional on insecure tip only |
| C4-F06 | Info — rate limit working as observed |

---

## Out of scope (this Blue)

- Cycle-5 PrivEsc / shells SoftDev (`v1.3.0` / `v2.3.0`)
- Re-breaking Cycle-1/2/3 Criticals
- Merging or “fixing forward” `ctf/v1.2.0` into `main`
- Removing Notes product surface

---

## Immediate next

1. Finish M0 checkboxes (this commit).  
2. **M1:** implement safe Notes render + attachment policy on this branch.  
3. **M2:** neutralize Cycle-4 seed plants on secure tip.  
4. Regression → gate → tag.
