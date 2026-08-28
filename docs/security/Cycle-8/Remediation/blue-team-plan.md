# Blue Team plan — Cycle-8 → `v2.5.0`

**Branch:** `remediation/v2.5.0` (from `main` @ tip `v1.5.0`)  
**Finding → fix map:** [v2.5.0-remediation.md](v2.5.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Secure-ready gate:** [v2.5.0-secure-ready.md](../../../release/v2.5.0-secure-ready.md)  
**Red evidence (frozen):** branch `ctf/v1.5.0` · tag `v1.5.0` · [writeup](../PenTest/v1.5.0-writeup.md)  
**ADR:** [ADR-036](../../../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md) · [ADR-037](../../../decisions/ADR-037-immersion-northwind-product-face.md)

| Field | Value |
|-------|-------|
| Cycle | 8 (Intake tool-chain + overlays) |
| From | Intentional insecure Intake SQLi + Cycle-8 compose overlays on `main` (`v1.5.0`) |
| To | Tag **`v2.5.0`** — Intake hardened; overlays unpublished on default prod; plants gone; **Northwind skin kept** |
| Current milestone | **Done** — tagged **`v2.5.0`** |
| Code status | Waves A–D complete · Cycle-8 **Closed** |

```text
main @ v1.5.0 (insecure tip)
  ──► remediation/v2.5.0 ──► PR main ──► tag v2.5.0
         ▲
ctf/v1.5.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close Cycle-8 Red findings on the **product tip**: Intake remains a feature behind `/api/intake/`, but **SQLi dies**; **FTP / Cowrie / edge privesc / Samba+mail overlays stay off default prod**; graded **plants leave the tip**. Keep Cycle-6/7 Blue controls closed. Tag **`v2.5.0`** as the hardened Northwind baseline.

**Success** = C8-F01…F05 Verified (or residual where accepted) · regression green · [v2.5.0-secure-ready.md](../../../release/v2.5.0-secure-ready.md) signed · merge → tag `v2.5.0` · `ctf/v1.5.0` intact.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + residuals + secure-ready scaffold | **Done** |
| **M1** | Wave A — Intake SQLi + F1 plant | Parameterized search; least-privilege DB role; no F1 on tip | **Done** |
| **M2** | Wave B — overlays / plants | Prod alone unpublished; remove F2–F5 tip plants; tip UI `v2.5.0` | **Done** |
| **M3** | Wave C — Blue asserts | `assert-cycle8-unpublished` + Intake negative assert in smoke/gate | **Done** |
| **M4** | Wave D — gate + tag | Smoke/journey/tls-smoke; PR → `main` → tag `v2.5.0` | **Done** |

### M0 — Plan

- [x] Branch `remediation/v2.5.0` from `main` @ `v1.5.0`
- [x] [v2.5.0-remediation.md](v2.5.0-remediation.md) finding → fix map (scaffold)
- [x] [blue-handoff.md](blue-handoff.md)
- [x] [accepted-residuals.md](accepted-residuals.md)
- [x] [v2.5.0-secure-ready.md](../../../release/v2.5.0-secure-ready.md) scaffold
- [x] Cross-links from Cycle-8 README / security index / STRATEGY

### M1 — Intake SQLi + F1 (must-close)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C8-F01 | Parameterize `q`; remove SQLi plant / F1 from seed responses; optional column allowlist on search | `intake/app/`, `intake/seed/seed.sql`, nginx proxy config |

### M2 — Overlays + remaining plants (must-close on tip)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C8-F02…C8-F05 | Keep `docker-compose.cycle8.yml` for **`ctf/v1.5.0` replay** only; prod compose never publishes `:21`/`:22`/internal SMB; strip tip plants from default secure path | `docker-compose.prod.yml`, `assert-cycle8-unpublished.sh`, `infra/cycle8/*` |
| C8-F03 | Decouple FTP upload from PHP execution (or remove FTP overlay on secure tip) | `infra/cycle8/ftp/`, `nginx-cycle8.conf`, edge image |
| C8-F04 | Remove `NOPASSWD` nano from edge secure build | `infra/cycle8/edge/` |

Overlay compose remains in-repo for archive — **must not** be required for day-to-day secure tip.

### M3 — Asserts

| Extra | Fix intent |
|-------|------------|
| Unpublished ports | `assert-cycle8-unpublished.sh` in smoke / secure-ready |
| Intake negative | Auth’d search cannot dump `mail_users` / no `OS{` in API |
| Tip version | UI / health tip string `v2.5.0` |

### M4 — Ship

- [x] Fill + sign secure-ready
- [x] smoke · journey · tls-smoke · cycle6/7/8 blue asserts · cycle8 unpublished assert
- [x] PR `remediation/v2.5.0` → `main`
- [x] Tag `v2.5.0` · freeze branch · reset `backend`/`frontend`/`dev` to `main`
- [x] Bucket B FC-19/20 → Consumed · Cycle-8 **Closed**

---

## Out of scope (this Blue)

Re-breaking Cycle-6 Preview/CSRF · Notes XSS · Cycle-7 Ops LFI · graded Cowrie path · AD / Windows · docker escape · re-introducing John=Hydra same secret.
