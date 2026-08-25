# Architecture Documentation

Historical docs below keep the **v1.0.0** insecure MVP snapshot (Cycle-1 before-state).  
**Current tip on `main`:** secure **`v2.2.0`** (Notes kept; XSS closed; no default SSH) — [Cycle-4](../security/Cycle-4/README.md) · [ADR-033](../decisions/ADR-033-cycle-4-softdev-version-pair.md).  
**Insecure replay:** tag/`ctf/v1.2.0` · [ADR-032](../decisions/ADR-032-post-v2.1.0-versioning.md) for CTF-only cycles.

- [ARCHITECTURE.md](ARCHITECTURE.md) — Docker prod topology (`:8080`), modules (incl. Notes), product UI vs `/dev`, trust boundaries
- [auth-flow.md](auth-flow.md) — Registration through ternary RBAC; Notes authz; guard history
- [data-model.md](data-model.md) — PostgreSQL schema, `Note` entity, demo seed IDs
- [stride.md](stride.md) — STRIDE analysis per attack surface

Cycle-1 ground truth: [v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) · Cycle-4 path (replay): [notes-ssh-path.md](../diagrams/notes-ssh-path.md)
