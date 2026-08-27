# Architecture Documentation

Historical docs below keep the **v1.0.0** insecure MVP snapshot (Cycle-1 before-state).  
**Current tip on `main`:** intentional insecure **`v1.5.0`** (Cycle-8 Northwind Intake — Red open) — [Cycle-8](../security/Cycle-8/README.md) · [ADR-036](../decisions/ADR-036-cycle-8-intake-tool-chain-pair.md).  
**Last hardened / secure replay:** tag **`v2.4.0`**. **Insecure replay:** tag/`ctf/v1.5.0` (+ Cycle-8 compose) · tag/`ctf/v1.4.0` · tag/`ctf/v1.3.0` · tag/`ctf/v1.2.0` · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) for CTF-only cycles.

- [ARCHITECTURE.md](ARCHITECTURE.md) — Docker prod topology (`:8080`), modules (incl. Notes / Preview / Ops), product UI vs `/dev`, trust boundaries
- [auth-flow.md](auth-flow.md) — Registration through ternary RBAC; Notes authz; guard history
- [data-model.md](data-model.md) — PostgreSQL schema, `Note` entity, demo seed IDs
- [stride.md](stride.md) — STRIDE analysis per attack surface

Cycle-1 ground truth: [v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) · Cycle-4 path (replay): [notes-ssh-path.md](../diagrams/notes-ssh-path.md)
