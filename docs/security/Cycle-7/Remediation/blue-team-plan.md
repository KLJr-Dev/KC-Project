# Blue Team plan — Cycle-7 → v2.4.0

**Branch:** `remediation/v2.4.0` (from `main` @ tip `v1.4.0`)  
**Finding → fix map:** [v2.4.0-remediation.md](v2.4.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Secure-ready gate:** [v2.4.0-secure-ready.md](../../../release/v2.4.0-secure-ready.md)  
**Red evidence (frozen):** branch `ctf/v1.4.0` · tag `v1.4.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.4.0/docs/security/Cycle-7/PenTest/v1.4.0-writeup.md)  
**ADR:** [ADR-035](../../../decisions/ADR-035-cycle-7-multi-service-pair.md)

| Field | Value |
|-------|-------|
| Cycle | 7 (product expansion + overlays) |
| From | Intentional insecure Ops LFI + Cycle-7 compose overlays on `main` (`v1.4.0`) |
| To | Tag **`v2.4.0`** — Ops Documents kept path-safe; overlays unpublished on default prod; plants gone |
| Current milestone | **M1** Wave A in progress / landing |
| Code status | Wave A (LFI) shipping; B–D pending |

```text
main @ v1.4.0 (insecure tip)
  ──► remediation/v2.4.0 ──► PR main ──► tag v2.4.0
         ▲
ctf/v1.4.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close Cycle-7 Red findings on the **product tip**: Ops Documents remains a feature, but **path traversal / LFI dies**; **FTP / SSH / Cowrie / jump overlays stay off default prod**; graded **plants leave the tip**. Keep Cycle-6 Preview/CSRF and Notes XSS closed. Tag **`v2.4.0`** as the hardened Northwind Ops baseline.

**Success** = C7-F01…F05 Verified (or residual where accepted) · regression green · [v2.4.0-secure-ready.md](../../../release/v2.4.0-secure-ready.md) signed · merge → tag `v2.4.0` · `ctf/v1.4.0` intact.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + residuals + secure-ready scaffold | **Done** |
| **M1** | Wave A — LFI + F1 plant | Path canonicalize + stay-under-root; no F1 plant / flag on tip | **Done** |
| **M2** | Wave B — overlays / plants | Prod alone unpublished; remove F2–F5 tip plants; tip UI `v2.4.0` | Pending |
| **M3** | Wave C — Blue asserts | `assert-cycle7-unpublished` + LFI negative assert in smoke/gate | Pending |
| **M4** | Wave D — gate + tag | Smoke/journey/tls-smoke; PR → `main` → tag `v2.4.0` | Pending |

### M0 — Plan

- [x] Branch `remediation/v2.4.0` from `main`
- [x] [v2.4.0-remediation.md](v2.4.0-remediation.md) finding → fix map
- [x] [accepted-residuals.md](accepted-residuals.md)
- [x] [v2.4.0-secure-ready.md](../../../release/v2.4.0-secure-ready.md) scaffold
- [x] Cross-links from Cycle-7 README / security index / STRATEGY

### M1 — LFI + F1 (must-close)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C7-F01 | Canonicalize `path`; reject escapes outside `ops-docs/library`; remove F1 plant file + tip flag constant | `ops.service.ts`, `cycle7-plants.ts`, `ops-docs/plants/` |

### M2 — Overlays + remaining plants (must-close on tip)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C7-F02…F05 | Keep `docker-compose.cycle7.yml` for replay only; prod compose never publishes `:21`/`:2222`/`:2223`/jump; strip tip plants/creds from default images where they would ship on secure demos | `docker-compose.prod.yml`, `assert-cycle7-unpublished.sh`, `infra/cycle7/` (archive/replay), tip version strings |

Overlay compose may remain in-repo for `ctf/v1.4.0` replay — **must not** be required for day-to-day secure tip.

### M3 — Asserts

| Extra | Fix intent |
|-------|------------|
| Unpublished ports | `assert-cycle7-unpublished.sh` in smoke / secure-ready |
| LFI negative | Auth’d `../` / plant path → reject / not found; no `OS{` in Ops responses |
| Tip version | UI / health tip string `v2.4.0` |

### M4 — Ship

- [ ] Fill + sign secure-ready
- [ ] smoke · journey · tls-smoke · cycle7 unpublished assert · LFI blue assert
- [ ] PR `remediation/v2.4.0` → `main`
- [ ] Tag `v2.4.0` · freeze this branch · reset `backend`/`frontend`/`dev` to `main`
- [ ] Bucket B FC-14 (FTP) / FC-18 → Consumed (Blue closed) · Portfolio sync

---

## Out of scope (this Blue)

Re-breaking Cycle-6 Preview/CSRF · Notes XSS · graded Cowrie path · AD / Windows · docker escape · Let’s Encrypt public DNS.
