# Architecture Documentation

Historical docs below keep the **v1.0.0** insecure MVP snapshot (Cycle-1 before-state).  
**Current tip on `main`:** SoftDev **intentional insecure** Notes + SSH (tag **`v1.2.0`** pending) — [Cycle-4](../security/Cycle-4/README.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md).  
**Last hardened product tag:** **`v2.1.0`** — [Cycle-2 Remediation](../security/Cycle-2/Remediation/v2.1.0-remediation.md) · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md).

- [ARCHITECTURE.md](ARCHITECTURE.md) — Docker prod topology (`:8080`), modules (incl. Notes SoftDev), product UI vs `/dev`, trust boundaries
- [auth-flow.md](auth-flow.md) — Registration through ternary RBAC; Notes authz; guard history
- [data-model.md](data-model.md) — PostgreSQL schema, `Note` SoftDev entity, demo seed IDs
- [stride.md](stride.md) — STRIDE analysis per attack surface

Cycle-1 ground truth: [v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) · Cycle-4 path: [notes-ssh-path.md](../diagrams/notes-ssh-path.md)
