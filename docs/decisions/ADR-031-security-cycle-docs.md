# ADR-031: Security Cycle Documentation Structure

**Status:** Accepted

**Date:** v1.0.0

---

## Context

KC-Project follows a perpetual expansion cycle (ADR-013): v1.N.0 (insecure) → v1.N.x (pentest) → v2.N.0 (secure) → v1.N+1.0 (new vulns). Pentest artifacts were scattered (`pentest-cheat-sheet.md`, release docs, deploy journeys) with no clear ownership for offensive vs defensive teams.

Phase 2 requires a portfolio-grade pentest writeup and a paired remediation document for v2.0.0.

## Decision

Organise security testing artifacts under `docs/security/Cycle-N/` with three team workspaces:

```
docs/security/Cycle-N/
├── README.md           # cycle index, version map, artifact checklist
├── Dev/                # developer ground truth per v1.X.Y
├── PenTest/            # offensive: writeup, notes, screenshots
└── Remediation/        # defensive: v2.X.Y remediation writeup
```

### Artifact pairing

| Insecure version | Dev artifact | PenTest artifact | Secure version | Remediation artifact |
|------------------|--------------|------------------|----------------|----------------------|
| v1.0.0 | `Dev/v1.0.0-ground-truth.md` | `PenTest/v1.0.0-writeup.md` | v2.0.0 | `Remediation/v2.0.0-remediation.md` |
| v1.1.0 | `Dev/v1.1.0-ground-truth.md` | `PenTest/v1.1.0-writeup.md` | v2.1.0 | `Remediation/v2.1.0-remediation.md` |

### Cross-cycle docs

- `docs/security/cwe-inventory.md` — shared across cycles; tag instances with `cycle: N`
- `docs/spec/security-baseline.md` — authoritative v2.N.0 control checklist

### Redirect policy

When ground truth moves into `Cycle-N/Dev/`, keep a one-line redirect at the old path (`pentest-cheat-sheet.md`) to avoid broken links.

## Consequences

- **Positive:** Clear team ownership (Dev / Offensive / Defensive)
- **Positive:** Portfolio pentest writeup has a dedicated, versioned home
- **Positive:** v1↔v2 doc pairing is explicit and repeatable per cycle
- **Negative:** More directory nesting; requires cross-link maintenance on moves
