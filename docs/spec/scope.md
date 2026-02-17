# Project Scope

Defines what KC-Project is, what it includes, and what it explicitly excludes. This is the "what are we building and why" document that sits above the [ROADMAP](../roadmap/ROADMAP.md) (which defines the build order).

---

## System Type

KC-Project is a **modern full-stack web application** built for security education through controlled failure.

- API-driven architecture with separate frontend and backend
- RESTful communication over HTTP/JSON
- Deployed on a Linux server environment (Ubuntu VM)
- Containerised using Docker and docker-compose
- Designed to mirror common enterprise web application patterns

---

## Core Functionality

The application implements five domain surfaces, each representing a realistic area of enterprise web functionality:

| Domain | Functionality |
|--------|--------------|
| **User Management** | Registration, authentication, session handling, profile data |
| **Role Management** | Multiple user roles (regular, admin), role-based access to functionality |
| **File Management** | Upload, view, download, and delete files owned by the authenticated user |
| **File Sharing** | Generate sharing links, public access to shared files, mixed public/private access |
| **Administration** | View user accounts, modify roles, access system-wide data (restricted by role) |

These five domains are implemented as independent backend modules (per [ADR-007](../decisions/ADR-007-five-domain-split.md)) and map directly to the roadmap's security surface progression.

---

## Design Characteristics

### Insecure-by-design

The system is **intentionally insecure** in its initial versions (v0.x, v1.0.0). Security weaknesses are introduced deliberately, not accidentally. Insecurity is treated as a controlled design variable, not a defect. See [ADR-006](../decisions/ADR-006-insecure-by-design.md).

### Enterprise-pattern mirror

The architecture mirrors how real production web applications are built: modular backend, typed API contracts, role-based access, file handling, containerised deployment. This ensures the vulnerabilities studied are realistic, not contrived.

### Iterative hardening

Each insecure version has a hardened counterpart. The project follows a perpetual expansion cycle (per [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md)): build insecure → pentest → harden → build new insecure surface → repeat.

---

## Security Context

### Controlled environment

- The system is deployed in a **private, isolated environment** (local development or private VM)
- **No real user data** is processed at any point
- The application is **not intended for public or production use**
- All vulnerabilities exist within an ethical and educational context

### Deliberate weaknesses

Security controls such as input validation, access control enforcement, and audit logging are intentionally reduced or omitted in v1.0.0. Authentication and authorisation mechanisms are implemented in minimal form to allow misuse and bypass. Infrastructure and deployment configurations prioritise simplicity over security.

### CORS permissive by design

The backend enables CORS with no restrictions (`app.enableCors()` with no origin whitelist). This is an intentional weakness (CWE-942 / A05:2021 Security Misconfiguration) that allows any origin to make API requests — including attacker-controlled domains in a real deployment. Remediated in v2.0.0 with strict origin whitelisting.

### Engineering validity

Designing insecure systems is a recognised practice in:

- Security training environments
- Red-team / blue-team exercises
- Secure SDLC education

The approach strengthens understanding of both how vulnerabilities emerge and how effective security controls should be applied.

---

## Lifecycle Orientation

The project is built to **evolve across multiple versions**. Each version represents a different security posture. Vulnerable and hardened versions coexist conceptually.

### Perpetual expansion cycle

```
v1.N.0 (insecure baseline)
  → v1.N.x (pentest + patch)
  → v2.N.0 (secure parallel)
  → v1.N+1.0 (fork secure, add new weaknesses)
  → repeat
```

See [ADR-013](../decisions/ADR-013-expansion-cycle-versioning.md) and [version-timeline.md](../diagrams/version-timeline.md) for the full model.

---

## In-Scope

### Application functionality

- User registration and authentication (plaintext → weak hash → bcrypt across versions)
- JWT-based session management (weak → secure across versions)
- File upload, download, metadata management, and deletion
- Public file sharing with link generation
- Role-based access control (user and admin roles)
- Administrative functions (user listing, role modification, system-wide views)

### Security surfaces

- Identity and authentication (v0.1.x)
- Persistence and database (v0.2.x)
- File handling (v0.3.x)
- Authorisation and RBAC (v0.4.x)
- Containerisation and deployment (v0.5.x)
- Runtime, configuration, and observability (v0.6.x)

### Infrastructure

- Docker containers for frontend, backend, and database
- docker-compose orchestration
- Ubuntu VM deployment
- Volume-based persistence (file uploads, database data)
- Self-hosted GitLab (v0.5.x+ per [ADR-014](../decisions/ADR-014-github-vcs.md))

### Security activities

- Structured penetration testing against each v1.N.0
- Vulnerability documentation with CWE + OWASP Top 10 classification
- Remediation and hardening to produce v2.N.0
- STRIDE threat modelling

### Documentation

- Architecture Decision Records (ADRs) for every significant technical choice
- System architecture and auth flow diagrams
- Threat model and infrastructure topology diagrams
- Formal requirements and security baseline specifications

---

## Out-of-Scope

The following are explicitly excluded from the project. Some may be introduced in future expansion cycles (v1.1.0+) but are not part of the core v0.x → v1.0.0 → v2.0.0 plan.

| Exclusion | Rationale |
|-----------|-----------|
| External identity providers (OAuth, SAML, OIDC) | Custom auth is the security surface being studied |
| WAF / IDS / SIEM | Defence tooling is out-of-scope for v1.0.0; may appear in v2.x |
| Performance tuning / benchmarking | Not a project goal |
| Scalability engineering (load balancing, clustering) | Single-VM deployment is sufficient |
| Compliance certifications (SOC 2, ISO 27001, PCI) | Not applicable to an educational project |
| Mobile clients (iOS, Android, React Native) | Web-only |
| GraphQL / WebSocket / tRPC | REST is the chosen API pattern ([ADR-003](../decisions/ADR-003-rest-over-trpc.md)). Other protocols may be added in v1.1.0+ expansion cycles |
| Monitoring and alerting (Prometheus, Grafana) | May be introduced in v0.6.x observability phase, but not core |
| Multi-tenancy | Single-tenant application |
| Internationalisation (i18n) | English only |
