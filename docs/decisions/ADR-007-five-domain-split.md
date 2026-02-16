# ADR-007: Five-Domain Module Split

## Status

Accepted

## Version

v0.0.6

## Context

KC-Project needs a modular backend structure from the start. The project's goal is to build an intentionally vulnerable web application that will later undergo penetration testing and security hardening. This means the architecture must expose distinct **security surfaces** that can each evolve, be exploited, and be remediated independently.

We needed to decide how many domain modules to create and which concerns they would cover.

## Decision

The backend is split into **five domain modules** from v0.0.6 onward:

| Module | Security Surface | Purpose |
|--------|-----------------|---------|
| **users** | Identity & data ownership | User CRUD — the core resource other modules reference |
| **auth** | Authentication & sessions | Registration, login, token/session handling |
| **files** | File upload/download | High-risk I/O surface (path traversal, MIME confusion, storage) |
| **sharing** | Access control on resources | Public/private links, cross-user access, IDOR surface |
| **admin** | Privilege & authorization | Role-based actions, privilege escalation surface |

Each module is self-contained with its own controller, service, and DTOs. They are all imported by `AppModule` but share no runtime dependencies at this stage.

### Why these five

- **users + auth are separate** because identity (who you are) and authentication (proving who you are) are distinct security concerns. Coupling them would make it harder to introduce auth-specific vulnerabilities (e.g., session fixation, token reuse) without touching user CRUD.
- **files is its own module** because file handling introduces an entirely different risk class (filesystem I/O, binary content, path traversal) that has nothing to do with user management or auth.
- **sharing exists separately from files** because access control decisions (who can see what) are a distinct authorization surface from the file I/O itself. Sharing will later enable IDOR and cross-user access testing.
- **admin is isolated** because privilege escalation and RBAC enforcement are their own security surface. Keeping admin separate means we can test whether unprivileged users can reach admin endpoints without tangling that logic into other modules.

### Why not fewer

Collapsing these into 2-3 modules would conflate security surfaces. For example, merging users + auth + admin would make it hard to test authentication bypass independently of privilege escalation. The project's learning value depends on being able to isolate and exploit each surface.

### Why not more

Five modules already cover the core attack surfaces defined in the roadmap (v0.1.x through v0.4.x). Adding more granular modules (e.g., separate "sessions" or "tokens" modules) would add boilerplate without meaningfully improving the security surface separation at this stage. More modules can be introduced later if needed.

## Consequences

**Positive:**

- Each security surface can evolve at its own pace per the roadmap
- Penetration testing can target modules individually
- Remediation in one module doesn't require touching others
- Maps cleanly to the roadmap's version structure (v0.1.x = identity, v0.3.x = files, v0.4.x = authorization)

**Negative:**

- More boilerplate in early versions (5 sets of controllers, services, DTOs for mock data)
- Some duplication of patterns across modules (mitigated by consistent internal structure)
- Cross-module dependencies (e.g., sharing referencing files, admin referencing users) will need explicit wiring when they arise in later versions

**Neutral:**

- The five modules are currently independent. Cross-module relationships will be introduced incrementally starting in v0.1.x (user entity referenced by other modules).
