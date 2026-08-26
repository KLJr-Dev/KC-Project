# Glossary

Quick reference for terminology used across KC-Project documentation and codebase.

---

## Security Terms

| Term | Definition | Reference |
|------|-----------|-----------|
| **CWE** | Common Weakness Enumeration. A catalogue of software and hardware weakness types. Each CWE has a numeric ID (e.g. CWE-89 = SQL Injection). Used to classify the project's intentional vulnerabilities. | [cwe.mitre.org](https://cwe.mitre.org/) |
| **CVE** | Common Vulnerabilities and Exposures. A specific, publicly disclosed vulnerability in a specific product version (e.g. CVE-2021-44228 = Log4Shell). CWEs classify weakness categories; CVEs identify specific instances. | [cve.mitre.org](https://cve.mitre.org/) |
| **OWASP Top 10** | The Open Web Application Security Project's list of the 10 most critical web application security risks, updated periodically. The 2025 edition is the current reference (migrated from 2021 in v0.2.3, see ADR-021). | [owasp.org/Top10](https://owasp.org/www-project-top-ten/) |
| **STRIDE** | A threat modelling framework (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege). Used to categorise threats per component or surface. | [stride.md](architecture/stride.md) |
| **IDOR** | Insecure Direct Object Reference. An access control flaw where a user can access resources by manipulating identifiers (e.g. changing `/files/1` to `/files/2`). Classified as CWE-639. | [threat-model.md](diagrams/threat-model.md) |
| **XSS** | Cross-Site Scripting. Injecting malicious scripts into pages viewed by others (CWE-79). Closed on tip `v2.2.0`; intentional on SoftDev tip `v1.2.0` (Notes HTML + unsafe markdown + inline SVG/HTML). | [Cycle-4](security/Cycle-4/README.md) |
| **CSRF** | Cross-Site Request Forgery (CWE-352). Refresh cookie path uses CSRF on hardened stacks; Cycle-6 plants one cookie mutation gap on intentional insecure `v1.3.0`. | [Cycle-6](security/Cycle-6/README.md), [security-baseline.md](spec/security-baseline.md) |
| **SSRF** | Server-Side Request Forgery (CWE-918). Cycle-6 Link Preview surface (`v1.3.0` planned). | [ADR-034](decisions/ADR-034-cycle-6-product-expansion-pair.md) |
| **SQLi** | SQL Injection. Inserting SQL code into application queries via user input. Classified as CWE-89. Part of the v1.0.0 injection surface. | [threat-model.md](diagrams/threat-model.md) |
| **RBAC** | Role-Based Access Control. Ternary roles: `user`, `moderator`, `admin`. Guards trust JWT `role` claim, not DB (CWE-639). Introduced in v0.4.x. | [requirements.md](spec/requirements.md) |
| **JWT** | JSON Web Token. A compact, URL-safe token format containing a signed JSON payload. Used for stateless authentication. | [ADR-012](decisions/ADR-012-jwt-over-sessions.md) |
| **HS256** | HMAC-SHA256. A symmetric JWT signing algorithm where the same secret is used to sign and verify. Used in v1.0.0 (weak). | [ADR-012](decisions/ADR-012-jwt-over-sessions.md) |
| **RS256** | RSA-SHA256. An asymmetric JWT signing algorithm where a private key signs and a public key verifies. Used in v2.0.0 (secure). | [security-baseline.md](spec/security-baseline.md) |
| **bcrypt** | A password hashing algorithm with a configurable cost factor. The v2.0.0 standard for password storage (cost 12). | [security-baseline.md](spec/security-baseline.md) |
| **TLS** | Transport Layer Security. Encrypts data in transit between client and server. TLS 1.3 is the v2.0.0 target. | [security-baseline.md](spec/security-baseline.md) |
| **HSTS** | HTTP Strict Transport Security. A header telling browsers to only connect via HTTPS. | [security-baseline.md](spec/security-baseline.md) |
| **CSP** | Content Security Policy. A header controlling which resources the browser is allowed to load. Mitigates XSS. | [security-baseline.md](spec/security-baseline.md) |

---

## Architecture Terms

| Term | Definition | Reference |
|------|-----------|-----------|
| **DTO** | Data Transfer Object. A class defining the shape of data sent over the network (request body or response body). In NestJS, DTOs are plain TypeScript classes. | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) |
| **DI** | Dependency Injection. A design pattern where dependencies are provided to a class rather than created inside it. NestJS uses constructor injection. | [ADR-001](decisions/ADR-001-nestjs-backend.md) |
| **Guard** | A NestJS construct that determines whether a request should be handled by a route. Used for authentication and authorisation checks. | [ADR-012](decisions/ADR-012-jwt-over-sessions.md) |
| **Pipe** | A NestJS construct that transforms or validates input data before it reaches a handler. Not yet used in the project. | -- |
| **Interceptor** | A NestJS construct that wraps route handlers to add extra logic (logging, transformation, caching). `FileInterceptor` used for multipart uploads (v0.3.0). | [ADR-024](decisions/ADR-024-file-storage-strategy.md) |
| **Multer** | Express middleware for handling `multipart/form-data` (file uploads). Bundled with `@nestjs/platform-express`. `diskStorage` used for local filesystem writes. | [ADR-024](decisions/ADR-024-file-storage-strategy.md) |
| **diskStorage** | A Multer storage engine that writes uploaded files directly to disk. KC-Project uses it with the client-supplied filename (no sanitisation). | [ADR-024](decisions/ADR-024-file-storage-strategy.md) |
| **Module** | A NestJS organisational unit grouping controllers/services. Product tip: 6 domain modules (Users, Auth, Files, Sharing, Admin, **Notes**) + AppModule. | [ADR-007](decisions/ADR-007-five-domain-split.md), [ADR-033](decisions/ADR-033-cycle-4-softdev-version-pair.md) |
| **RSC** | React Server Components. A Next.js feature where components render on the server by default. KC-Project uses `'use client'` on all pages instead. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **BFF** | Backend For Frontend. A pattern where the frontend's server (e.g. Next.js) proxies API calls, hiding the real backend from the browser. Not used in v1.0.0. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **SPA** | Single-Page Application. A web application where the browser loads a single HTML page and dynamically updates it via JavaScript. KC-Project's frontend behaves as an SPA. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **OpenAPI** | A specification for describing REST APIs in a machine-readable format (JSON/YAML). The backend generates an OpenAPI spec via `@nestjs/swagger`. | [ADR-018](decisions/ADR-018-swagger-cli-plugin.md) |
| **ERD** | Entity Relationship Diagram. A visual representation of database entities and their relationships. | [data-model.md](architecture/data-model.md) |

---

## Project Terms

| Term | Definition | Reference |
|------|-----------|-----------|
| **Attack surface** | The set of points where an attacker can interact with a system. KC-Project defines 6 surfaces: Identity, Data, Injection, File, Authorization, Infrastructure. v1.0.0 documents **59 CWE instances across 38 unique CWE IDs**. | [cwe-inventory.md](security/cwe-inventory.md), [threat-model.md](diagrams/threat-model.md) |
| **Trust boundary** | A line where the level of trust changes. In KC-Project, the primary trust boundary is between the browser (untrusted) and the backend API. | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) |
| **Expansion cycle** | The perpetual v1.N.0 (insecure) -> v1.N.x (pentest) -> v2.N.0 (secure) -> v1.N+1.0 (new insecure) loop. | [ADR-013](decisions/ADR-013-expansion-cycle-versioning.md) |
| **Insecure-by-design** | The project philosophy of introducing security weaknesses deliberately, then discovering and fixing them through structured pentesting. | [ADR-006](decisions/ADR-006-insecure-by-design.md) |
| **Security baseline** | The set of security controls that must be implemented for a version to qualify as v2.N.0 (hardened). | [security-baseline.md](spec/security-baseline.md) |
| **Pentest cycle** | The v1.N.x phase where the insecure baseline is systematically tested, findings documented, and patches applied. | [ADR-013](decisions/ADR-013-expansion-cycle-versioning.md) |
| **ADR** | Architecture Decision Record. A document capturing a specific technical decision with context, rationale, and consequences. | [decisions/](decisions/) |
| **Moderator** | Intermediate RBAC role (`moderator`) between `user` and `admin`. Reviews pending file uploads via `/moderator`; can call `PUT /files/:id/approve` and `PUT /admin/users/:id/role/escalate` (CWE-269). Demo: `mod@kc.test`. | [personas.md](spec/personas.md) |
| **Product expansion cycle** | Security cycle that adds new product surface and ships an intentional insecure tag `v1.N.0` then hardened `v2.N.0`. Preferred term over informal “SoftDev.” | [ADR-034](decisions/ADR-034-cycle-6-product-expansion-pair.md) |
| **Feature lanes** | Long-lived `backend` / `frontend` / `dev` branches for product work ([ADR-015](decisions/ADR-015-branching-strategy.md)). Reset from `main` at expansion-cycle start. | [ADR-015](decisions/ADR-015-branching-strategy.md) |
| **Security SDL** | Waterfall-shaped stages: Dev (design) → implement → verify → release → PenTest → Remediation ([ADR-031](decisions/ADR-031-security-cycle-docs.md)). | [Cycle-6 execution](security/Cycle-6/Dev/v1.3.0-execution-plan.md) |
| **Intentional insecure release** | Tagged `v1.N.0` on `main` (then often archived as `ctf/v1.N.0`) for Red. Prefer over “SoftDev tip.” | [ADR-034](decisions/ADR-034-cycle-6-product-expansion-pair.md) |
| **SoftDev tip** | **Legacy informal** for intentional insecure tip via feature lanes (Cycle-4 = tag/`ctf/v1.2.0`). Prefer **intentional insecure release**. Current `main` tip is secure **`v2.2.0`** until Cycle-6 ships. | [ADR-033](decisions/ADR-033-cycle-4-softdev-version-pair.md) |
| **Foothold** | SSH user access without PrivEsc. Cycle-4 ceiling is `lab` + `user.txt`; Cycle-5 covers shells/root. | [Cycle-4](security/Cycle-4/README.md), [Cycle-5](security/Cycle-5/README.md) |
| **Notes** | Sixth product domain: user-owned notes, search, mod flag, optional attachment. Plain text on `v2.2.0`; XSS sinks on insecure tip `v1.2.0`. | [Cycle-4](security/Cycle-4/README.md) |
| **Link Preview** | Planned seventh product surface (Cycle-6): server fetches a user-supplied URL for a preview snippet. | [Cycle-6](security/Cycle-6/README.md) |
| **Product UI** | Role-aware web app at `/`, `/auth`, `/files`, `/notes`, `/sharing`, `/moderator`, `/admin`, `/share/[token]`. Client filters are **not** the security boundary. | [scope.md](spec/scope.md) |
| **Ground truth** | Examiner reference for a tip: demo creds, seeds, flags, paths. Cycle-1: [v1.0.0-ground-truth](security/Cycle-1/Dev/v1.0.0-ground-truth.md); Cycle-4: [v1.2.0-ground-truth](security/Cycle-4/Dev/v1.2.0-ground-truth.md). | -- |
| **Cycle-1** | First expansion cycle: v1.0.0 → v2.0.0. | [Cycle-1/README.md](security/Cycle-1/README.md) |
| **Cycle-4** | Product expansion pair **closed**: `v1.2.0` (Notes XSS + SSH) → `v2.2.0` (harden Notes; no default SSH). | [ADR-033](decisions/ADR-033-cycle-4-softdev-version-pair.md) |
| **Cycle-5** | CTF-only shells/PrivEsc **closed** (`ctf/shells-privesc`); no product tag bump. | [Cycle-5](security/Cycle-5/README.md) |
| **Cycle-6** | Product expansion **in design**: Link Preview SSRF + CSRF → planned `v1.3.0` → `v2.3.0`. | [ADR-034](decisions/ADR-034-cycle-6-product-expansion-pair.md) |
