# ADR-039: Cycle-10 Enterprise Lab + Production Showcase Pair (`v1.10.0` → `v2.10.0`)

**Status:** Accepted (P0 on `docs/cycle-10-p0`) — amends [ADR-032](./ADR-032-post-v2.1.0-versioning.md); follows [ADR-038](./ADR-038-cycle-9-onboarding-defence-pair.md) post-pair skip to `*.10.0`

**Date:** 2026-11-15

---

## Context

Cycle-9 closed AppSec onboarding plants and ~80% of absolute lab gaps on **`v2.6.0`**, explicitly deferring production-grade leftovers (TLS-default, Docker Secrets, read-only rootfs, strict CSP, demo strip) and a deeper enterprise network story to **Cycle-10**.

Portfolio needs a crown-jewel chapter that proves:

1. **SoftDev** — design a segmented, multi-host Northwind platform (not a single compose “app with props”).  
2. **Red** — HTB/OSCP-style engagement: anonymous start, web chain, reverse shell, privilege escalation, pivot, full compromise.  
3. **Blue** — harden to a **zero accepted-security-residual** tip on **`v2.10.0`**.

## Decision

### Version pair

| Work | Tags | Branches |
|------|------|----------|
| Enterprise lab + product expansion | **`v1.10.0`** → **`v2.10.0`** | lanes → `dev` → `main`; `ctf/v1.10.0`; `remediation/v2.10.0` |
| Versions 1.7–1.9 / 2.7–2.9 | **Unused** | Milestone skip (ADR-038) |

Baseline before SoftDev code: secure tip **`v2.6.0`**.

### Five-zone enforced network

Compose networks **DMZ · APP · DATA · CORP · MGMT** plus **`fw`** (iptables/nftables). Bridge membership alone is not an allowlist; cross-zone traffic is default-deny except a documented matrix.

| Insecure `v1.10.0` | Secure `v2.10.0` |
|--------------------|------------------|
| Lab hosts + documented fw exceptions | Exceptions removed; LIVE OS plants gone |
| Weak HTTPS at edge | HTTPS default, redirects, strict cookies/headers |
| One lab compose entrypoint | Product compose without attack plants |

### Graded path (summary)

HTML comment → hidden public directory → document-portal access → **`moderator`** session → packet upload → **`docproc`** helper RCE → `local` / `proof` → **`db-archive`** → **mail** (required) → **files** → **`integrate`** → **`bastion`** crown.

**Hard gates:** plain `user` cannot use packets (403) · bastion reachable **only from `integrate`** · bastion secret requires **`docproc` root**.

### Packaging

- SoftDev surface growth earns the version pair ([ADR-032](./ADR-032-post-v2.1.0-versioning.md)).  
- P0 design docs: `docs/cycle-10-p0` → `main` before plant code ([ADR-015](./ADR-015-branching-strategy.md)).  
- Skin: [ADR-037](./ADR-037-immersion-northwind-product-face.md).  
- Identity (Keycloak-style) + DNS on both tips for SoftEng realism; **not** graded exploit surface on `v1.10.0`.

### Out of scope / must not

- AD / Windows VMs  
- Re-break closed Criticals (Preview SSRF, bookmark CSRF, Notes XSS, Ops LFI, Intake SQLi, Cycle-9 onboarding plants)  
- Parallel public FastAPI product port  
- Claiming `v2.6.0` was production-complete  

### Blue claim

`v2.10.0` ships **empty accepted-security residuals** for the production showcase (TLS-default, secrets, RO fs, CSP, demo strip, strict matrix, defense UI with logs/alerts — not a full SIEM product).

## Consequences

- **Positive:** Single cycle showcases architecture, advanced pentest, and production harden.  
- **Trade-off:** Heavy infra vs prior AppSec-only cycles; examiner must assert reachability + DAG.  
- **Follow-on:** Deep SIEM curriculum remains optional post-`v2.10.0` / Cycle-11+; portfolio showcase docs after Blue.

## References

- [Cycle-10 decisions](../security/Cycle-10/Dev/cycle-10-decisions.md) · [v1.10.0 topology](../diagrams/c10-v1.10.0-topology.md) · [v1.10.0 summary](../security/Cycle-10/Dev/v1.10.0-summary.md)  
- [ADR-015](./ADR-015-branching-strategy.md) · [ADR-031](./ADR-031-security-cycle-docs.md) · [ADR-037](./ADR-037-immersion-northwind-product-face.md) · [ADR-038](./ADR-038-cycle-9-onboarding-defence-pair.md)
