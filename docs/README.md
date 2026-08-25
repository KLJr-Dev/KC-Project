# Documentation

Engineering and technical documentation for KC-Project.

## Contents

### [spec/](spec/)

- [scope.md](spec/scope.md) — system boundaries, product UI vs API
- [requirements.md](spec/requirements.md) — functional, non-functional, security requirements
- [personas.md](spec/personas.md) — stakeholders and in-app personas
- [security-baseline.md](spec/security-baseline.md) — secure-product control checklist

### [architecture/](architecture/)

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — SoftDev tip (Notes + SSH) + historical v1.0.0 snapshot; last secure tag `v2.1.0`
- [auth-flow.md](architecture/auth-flow.md) — auth/RBAC flows
- [data-model.md](architecture/data-model.md) — entities incl. Notes, demo seed IDs
- [stride.md](architecture/stride.md) — STRIDE per attack surface

### [decisions/](decisions/)

ADRs 001–033. Index: [decisions/README.md](decisions/README.md). Recent: **ADR-033** (Cycle-4 SoftDev pair), ADR-032 (CTF-only versioning).

### [deploy/](deploy/)

- [demo-users.md](deploy/demo-users.md) — seeded test accounts, files, notes
- [pentest-journeys.md](deploy/pentest-journeys.md) — exploit journey narratives
- [vm-deployment.md](deploy/vm-deployment.md) — Ubuntu Docker deploy

### [diagrams/](diagrams/)

System architecture, Notes→SSH path, auth flow, threat model, infrastructure, version timeline.

### [roadmap/](roadmap/)

- [STRATEGY.md](roadmap/STRATEGY.md) — canonical authority (ADR-027)
- [PORTFOLIO-VISION.md](roadmap/PORTFOLIO-VISION.md)
- [ROADMAP.md](roadmap/ROADMAP.md)
- Summaries: v0.0.x through v0.9.x

### [security/](security/)

Cycle workspaces (ADR-031):

```
docs/security/
├── Cycle-1/   → closed (v1.0.0 → v2.0.0); PenTest on main
├── Cycle-2/   → closed (v1.1.0 → v2.1.0); Remediation on main; PenTest on ctf/v1.1.0
├── Cycle-3/   → closed (ctf/leak-crack-db → Blue on main; no product tag)
├── Cycle-4/   → SoftDev on main (v1.2.0 tip; tag pending); Notes + SSH foothold
├── Cycle-5/   → sketch; shells + PrivEsc after Cycle-4 Blue
├── README.md
└── cwe-inventory.md
```

- [README.md](security/README.md) — cycle index + methodology
- [cwe-inventory.md](security/cwe-inventory.md) — Cycle-1 inventory + Cycle-4 Notes XSS pointer

### [release/](release/)

- [v1.0.0.md](release/v1.0.0.md) — insecure MVP release notes
- [v1.0.0-pentest-ready.md](release/v1.0.0-pentest-ready.md) — Cycle-1 Red gate (passed)
- [v2.0.0-secure-ready.md](release/v2.0.0-secure-ready.md) — Cycle-1 Blue gate (signed)
- [v1.1.0-ctf-ready.md](release/v1.1.0-ctf-ready.md) — Cycle-2 CTF gate
- [v2.1.0-secure-ready.md](release/v2.1.0-secure-ready.md) — Cycle-2 Blue gate (signed; tag `v2.1.0`)
- [cycle-3-leak-crack-db-secure-ready.md](release/cycle-3-leak-crack-db-secure-ready.md) — Cycle-3 Blue gate (signed)
- [v1.2.0-pentest-ready.md](release/v1.2.0-pentest-ready.md) — Cycle-4 SoftDev Red gate (unsigned until tag)

### [glossary.md](glossary.md)
