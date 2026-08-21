# Architecture Documentation

System architecture docs below describe the **v1.0.0** insecure MVP snapshot (useful for Cycle-1 before-state).  
**Current product on `main`:** tag **`v2.0.0`** secure parallel — see [Cycle-1 Remediation](../security/Cycle-1/Remediation/v2.0.0-remediation.md).

- [ARCHITECTURE.md](ARCHITECTURE.md) — Docker prod topology (`:8080`), module structure, product UI vs `/dev` explorers, API design, trust boundaries
- [auth-flow.md](auth-flow.md) — Registration through ternary RBAC; guard inconsistencies; canonical detail
- [data-model.md](data-model.md) — PostgreSQL schema, `publicToken`, `approvalStatus`, `AuditLog`, demo seed IDs
- [stride.md](stride.md) — STRIDE analysis per attack surface (59/38 CWEs)

Cycle-1 ground truth: [v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md)
