# Diagrams

Canonical standalone diagrams for KC-Project. These provide comprehensive, cross-version views of the system.

Inline diagrams in [architecture/](../architecture/) documents remain as version-specific references. The files here are the authoritative counterparts.

**Last verified:** v1.0.0 (Docker prod `:8080`, 59/38 CWEs, 150 e2e tests).

---

## Contents

### [system-architecture.md](system-architecture.md)

System topology: v1.0.0 Docker prod (nginx `:8080`, primary), dev native path, and v2.0.0 secure parallel.

### [auth-flow.md](auth-flow.md)

Sequence diagrams for auth lifecycle. **Canonical narrative:** [architecture/auth-flow.md](../architecture/auth-flow.md).

### [threat-model.md](threat-model.md)

v1.0.0 attack surface (59 instances / 38 CWE IDs) with dual CWE + OWASP classification. Product UI vs API boundary noted. v2.0.0 remediation map.

### [infrastructure.md](infrastructure.md)

Prod (`docker-compose.prod.yml`) vs dev (`compose.yml`) deployment topology and v2.0.0 hardened target.

### [version-timeline.md](version-timeline.md)

Development progression through v1.0.0, perpetual expansion cycle, and CWE growth model.
