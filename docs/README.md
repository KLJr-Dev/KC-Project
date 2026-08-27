# Documentation

Engineering and technical documentation for KC-Project.

**Current tip:** intentional insecure **`v1.5.0`** on `main` (Cycle-8 — Red open). **Last hardened:** tag **`v2.4.0`**. **Play map:** [USAGE.md](../USAGE.md).

## Contents

### [spec/](spec/)

- [scope.md](spec/scope.md) — system boundaries, product UI vs API
- [requirements.md](spec/requirements.md) — functional, non-functional, security requirements
- [personas.md](spec/personas.md) — stakeholders and in-app personas
- [security-baseline.md](spec/security-baseline.md) — secure-product control checklist

### [architecture/](architecture/)

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — tip topology + historical snapshots; pin tags for demos
- [auth-flow.md](architecture/auth-flow.md) — auth/RBAC flows
- [data-model.md](architecture/data-model.md) — entities incl. Notes, demo seed IDs
- [stride.md](architecture/stride.md) — STRIDE per attack surface

### [decisions/](decisions/)

ADRs 001–037. Index: [decisions/README.md](decisions/README.md). Recent: **ADR-037** / **ADR-036** (Cycle-8), ADR-035 (Cycle-7), ADR-034 (Cycle-6).

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
├── Cycle-1/ … Cycle-7/   → closed (see security README)
├── Cycle-8/   → insecure tip v1.5.0 / ctf/v1.5.0 — Red open
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
- [v1.2.0-pentest-ready.md](release/v1.2.0-pentest-ready.md) — Cycle-4 expansion Red gate (signed; tag `v1.2.0`)
- [v2.2.0-secure-ready.md](release/v2.2.0-secure-ready.md) — Cycle-4 Blue gate (signed; tag `v2.2.0`)
- [shells-privesc-secure-ready.md](release/shells-privesc-secure-ready.md) — Cycle-5 Blue gate (signed)
- [v1.3.0-pentest-ready.md](release/v1.3.0-pentest-ready.md) / [v2.3.0-secure-ready.md](release/v2.3.0-secure-ready.md) — Cycle-6
- [v1.4.0-pentest-ready.md](release/v1.4.0-pentest-ready.md) / [v2.4.0-secure-ready.md](release/v2.4.0-secure-ready.md) — Cycle-7
- [v1.5.0-pentest-ready.md](release/v1.5.0-pentest-ready.md) — Cycle-8 Red gate (**signed** · tag `v1.5.0`)

### [glossary.md](glossary.md)
