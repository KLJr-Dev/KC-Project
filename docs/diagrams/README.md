# Diagrams

Canonical standalone diagrams for KC-Project. These provide comprehensive, forward-looking views of the system across its lifecycle.

Inline diagrams in [architecture/](../architecture/) documents remain as version-specific references. The files here are the authoritative, cross-version counterparts.

---

## Contents

### [system-architecture.md](system-architecture.md)

System topology at three lifecycle stages: current development state (v0.1.x), v1.0.0 insecure MVP (direct port exposure, no reverse proxy), and v2.0.0 secure parallel (nginx, internal network, hardened containers).

### [auth-flow.md](auth-flow.md)

Authentication flows from current stub tokens through v1.0.0 full insecure session lifecycle (JWT with weak secret, no expiry, no revocation) to v2.0.0 secure auth (bcrypt, short-lived tokens, refresh rotation, httpOnly cookies). All weaknesses mapped to CWE + OWASP Top 10.

### [threat-model.md](threat-model.md)

Complete v1.0.0 attack surface map (~20 weaknesses across 6 surfaces) with dual CWE + OWASP Top 10 classification. Includes v2.0.0 remediation map showing the specific control applied for each weakness.

### [infrastructure.md](infrastructure.md)

Deployment topology for v1.0.0 (docker-compose with all ports exposed, default credentials, root containers) and v2.0.0 (nginx reverse proxy, TLS, internal-only services, non-root containers). Delta table mapping each change to the CWE/OWASP item it remediates.

### [version-timeline.md](version-timeline.md)

Development progression from v0.0.x through v1.0.0, the perpetual insecure/secure expansion cycle (v1.N.0 → v1.N.x → v2.N.0 → v1.N+1.0), and cumulative security surface growth across cycles.
