# Blue Team plan — Cycle-6 → v2.3.0

**Branch:** `remediation/v2.3.0` (from `main` @ tip `v1.3.0`)  
**Finding → fix map:** [v2.3.0-remediation.md](v2.3.0-remediation.md)  
**Residuals:** [accepted-residuals.md](accepted-residuals.md)  
**Secure-ready gate:** [v2.3.0-secure-ready.md](../../../release/v2.3.0-secure-ready.md)  
**Red evidence (frozen):** branch `ctf/v1.3.0` · tag `v1.3.0` · [writeup](https://github.com/KLJr-Dev/KC-Project/blob/ctf/v1.3.0/docs/security/Cycle-6/PenTest/v1.3.0-writeup.md)  
**ADR:** [ADR-034](../../../decisions/ADR-034-cycle-6-product-expansion-pair.md)

| Field | Value |
|-------|-------|
| Cycle | 6 (product expansion security pair) |
| From | Intentional insecure Link Preview + bookmark CSRF on `main` (`v1.3.0`) |
| To | Tag **`v2.3.0`** — Preview kept; fetch restricted; CSRF restored; SSDLC extras (Preview throttle + TLS gate) |
| Current milestone | **M4** — secure-ready signed; PR pending |
| Code status | Waves A–D complete |

```text
main @ v1.3.0 (insecure tip)
  ──► remediation/v2.3.0 ──► PR main ──► tag v2.3.0
         ▲
ctf/v1.3.0 (frozen Red) ── findings only; do not merge CTF into main
```

---

## Mission

Close Cycle-6 Red findings on the **product tip**: Link Preview remains a feature, but **open SSRF dies**, **bookmark CSRF is closed** (parity with refresh), and graded **plants leave the tip**. Showcase SSDLC with **Preview rate limiting** and a required **TLS profile** at the secure-ready gate. Tag **`v2.3.0`** so Cycle-7 can fork a hardened baseline.

**Success** = C6-F01…F02 Verified · SSDLC extras Verified · regression green · [v2.3.0-secure-ready.md](../../../release/v2.3.0-secure-ready.md) signed · merge → tag `v2.3.0` · `ctf/v1.3.0` intact.

---

## Milestones

| ID | Goal | Exit criteria | Status |
|----|------|---------------|--------|
| **M0** | Plan signed | Blue plan + remediation map + residuals + secure-ready scaffold | **Done** |
| **M1** | Wave A — SSRF + F1 plant | Fetch blocks loopback/link-local/IMDS; no `/internal/cycle6-flag` prize on tip | **Done** |
| **M2** | Wave B — CSRF + F2 plant | Bookmarks require CSRF; no `proof` flag on tip; tip UI `v2.3.0` | **Done** |
| **M3** | Wave C — SSDLC extras | Preview rate limit; TLS gate + tls-smoke in secure-ready | **Done** |
| **M4** | Wave D — gate + tag | Blue asserts + smoke/journey/tls-smoke; PR → `main` → tag `v2.3.0` | **In progress** |

### M0 — Plan

- [x] Branch `remediation/v2.3.0` from `main`
- [x] [v2.3.0-remediation.md](v2.3.0-remediation.md) finding → fix map
- [x] [accepted-residuals.md](accepted-residuals.md)
- [x] [v2.3.0-secure-ready.md](../../../release/v2.3.0-secure-ready.md) scaffold
- [x] Cross-links from Cycle-6 README / Remediation index

### M1 — SSRF + F1 (must-close)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C6-F01 | Restrict Preview fetch; block loopback, link-local, cloud metadata; remove internal prize route / F1 | `backend/src/preview/preview.service.ts`, `preview.controller.ts`, `cycle6-plants.ts` |

### M2 — CSRF + F2 (must-close)

| Finding | Fix intent | Primary files |
|---------|------------|---------------|
| C6-F02 | `assertCsrfHeader` (or equivalent) on bookmark `POST` + `GET …/save`; remove F2 `proof` | `bookmarks.controller.ts`, `bookmarks.service.ts` |

### M3 — SSDLC extras

| Extra | Fix intent |
|-------|------------|
| Preview throttle | Nest throttler and/or nginx limit on `POST /preview` |
| TLS gate | Require `tls-smoke` in secure-ready; document HTTPS `:8443` recruiter path |
| Tip version | UI / health tip string `v2.3.0` |

### M4 — Ship

- [ ] Fill + sign secure-ready
- [ ] smoke · journey · e2e-docker · tls-smoke
- [ ] PR `remediation/v2.3.0` → `main`
- [ ] Tag `v2.3.0` · freeze this branch · reset `backend`/`frontend`/`dev` to `main`
- [ ] Bucket B FC-02/FC-03 → Consumed · Portfolio sync

---

## Out of scope (this Blue)

PrivEsc · FTP · Cowrie · Notes XSS re-break · Cycle-7 compose · Let’s Encrypt public DNS.
