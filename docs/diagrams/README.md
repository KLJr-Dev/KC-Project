# Diagrams

Canonical standalone diagrams for KC-Project.

Inline diagrams in [architecture/](../architecture/) remain version-specific. Files here are the cross-cutting counterparts.

**Last verified:** product tip tag **`v2.6.0`** · Cycle-10 SoftDev P0 diagrams for **`v1.10.0`** (insecure design).

---

## Contents

### Cycle-10 / `v1.10.0` (design)

- [c10-v1.10.0-topology.md](c10-v1.10.0-topology.md) — five-zone lab topology  
- [c10-v1.10.0-auth-flow.md](c10-v1.10.0-auth-flow.md) — access request → moderator → packets  
- [c10-v1.10.0-attack-graph.md](c10-v1.10.0-attack-graph.md) — graded compromise DAG  
- [c10-v1.10.0-dependency-graph.md](c10-v1.10.0-dependency-graph.md) — SoftDev call graph  

### [system-architecture.md](system-architecture.md)

System topology: secure tip `v2.2.0` (Notes; no default SSH), SoftDev replay path, historical v1.0.0 Docker prod.

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
