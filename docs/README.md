# Documentation

Engineering and technical documentation for KC-Project.

## Contents

### [spec/](spec/)

- [scope.md](spec/scope.md) — system boundaries, product UI vs API
- [requirements.md](spec/requirements.md) — functional, non-functional, security requirements
- [personas.md](spec/personas.md) — stakeholders and in-app personas
- [security-baseline.md](spec/security-baseline.md) — v2.0.0 control checklist

### [architecture/](architecture/)

- [ARCHITECTURE.md](architecture/ARCHITECTURE.md) — v1.0.0 system overview, Docker prod topology
- [auth-flow.md](architecture/auth-flow.md) — auth/RBAC flows, guard inconsistencies
- [data-model.md](architecture/data-model.md) — entities, demo seed IDs, AuditLog
- [stride.md](architecture/stride.md) — STRIDE per attack surface

### [decisions/](decisions/)

ADRs 001–031. Index: [decisions/README.md](decisions/README.md). Recent: ADR-028 (product UX), ADR-029 (demo users), ADR-030 (demo files/shares), ADR-031 (Cycle-1 security doc structure).

### [deploy/](deploy/)

- [demo-users.md](deploy/demo-users.md) — seeded test accounts and files
- [pentest-journeys.md](deploy/pentest-journeys.md) — exploit journey narratives
- [vm-deployment.md](deploy/vm-deployment.md) — Ubuntu Docker deploy

### [diagrams/](diagrams/)

System architecture, auth flow, threat model, infrastructure, version timeline.

### [roadmap/](roadmap/)

- [STRATEGY.md](roadmap/STRATEGY.md) — canonical authority (ADR-027)
- [ROADMAP.md](roadmap/ROADMAP.md)
- Summaries: v0.0.x through v0.9.x

### [security/](security/)

Cycle-1 workspace (ADR-031):

```
docs/security/Cycle-1/
├── README.md
├── Dev/           → v1.0.0-ground-truth.md (developer cheat sheet)
├── PenTest/       → v1.0.0-writeup.md (offensive writeup)
└── Remediation/   → v2.0.0-remediation.md (defensive target)
```

- [pentest-cheat-sheet.md](security/pentest-cheat-sheet.md) — redirect to ground truth
- [README.md](security/README.md) — pentest methodology
- [cwe-inventory.md](security/cwe-inventory.md) — 59 instances / 38 CWE IDs

### [release/](release/)

- [v1.0.0.md](release/v1.0.0.md)
- [v1.0.0-pentest-ready.md](release/v1.0.0-pentest-ready.md) — readiness gate

### [glossary.md](glossary.md)
