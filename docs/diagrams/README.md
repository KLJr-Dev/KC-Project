# Diagrams

Canonical standalone diagrams for KC-Project.

Inline diagrams in [architecture/](../architecture/) remain version-specific. Files here are the cross-cutting counterparts.

**Last verified:** SoftDev tip on `main` (Notes + optional SSH; tag `v1.2.0` pending) · last secure tag `v2.1.0`.

---

## Contents

### [system-architecture.md](system-architecture.md)

System topology: SoftDev tip (Notes + optional SSH), historical v1.0.0 Docker prod, v2.0.0 secure parallel.

### [notes-ssh-path.md](notes-ssh-path.md)

Cycle-4 SoftDev path: Notes XSS / privileged read → SSH foothold → `user.txt`.

### [auth-flow.md](auth-flow.md)

Sequence diagrams for auth lifecycle. **Canonical narrative:** [architecture/auth-flow.md](../architecture/auth-flow.md).

### [threat-model.md](threat-model.md)

v1.0.0 attack surface + SoftDev Notes XSS / SSH plant callouts.

### [infrastructure.md](infrastructure.md)

Prod (`docker-compose.prod.yml`), SoftDev SSH overlay, e2e / TLS overlays, asserts.

### [version-timeline.md](version-timeline.md)

Build phase through SoftDev pairs (ADR-032 CTF-only vs ADR-033 SoftDev).
