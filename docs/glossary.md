# Glossary

Quick reference for terminology used across KC-Project documentation and codebase.

---

## Security Terms

| Term | Definition | Reference |
|------|-----------|-----------|
| **CWE** | Common Weakness Enumeration. A catalogue of software and hardware weakness types. Each CWE has a numeric ID (e.g. CWE-89 = SQL Injection). Used to classify the project's intentional vulnerabilities. | [cwe.mitre.org](https://cwe.mitre.org/) |
| **CVE** | Common Vulnerabilities and Exposures. A specific, publicly disclosed vulnerability in a specific product version (e.g. CVE-2021-44228 = Log4Shell). CWEs classify weakness categories; CVEs identify specific instances. | [cve.mitre.org](https://cve.mitre.org/) |
| **OWASP Top 10** | The Open Web Application Security Project's list of the 10 most critical web application security risks, updated periodically. The 2021 edition is the current reference. | [owasp.org/Top10](https://owasp.org/www-project-top-ten/) |
| **STRIDE** | A threat modelling framework (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege). Used to categorise threats per component or surface. | [stride.md](architecture/stride.md) |
| **IDOR** | Insecure Direct Object Reference. An access control flaw where a user can access resources by manipulating identifiers (e.g. changing `/files/1` to `/files/2`). Classified as CWE-639. | [threat-model.md](diagrams/threat-model.md) |
| **XSS** | Cross-Site Scripting. Injecting malicious scripts into web pages viewed by other users. Classified as CWE-79. Not in v1.0.0 scope but planned for v1.1.0 expansion. | -- |
| **CSRF** | Cross-Site Request Forgery. Tricking a user's browser into making unintended requests to a site where they're authenticated. Classified as CWE-352. Planned for v1.1.0 expansion. | -- |
| **SSRF** | Server-Side Request Forgery. Tricking the server into making requests to internal resources. Classified as CWE-918. Planned for v1.1.0 expansion. | -- |
| **SQLi** | SQL Injection. Inserting SQL code into application queries via user input. Classified as CWE-89. Part of the v1.0.0 injection surface. | [threat-model.md](diagrams/threat-model.md) |
| **RBAC** | Role-Based Access Control. Restricting system access based on user roles (e.g. `user` vs `admin`). Introduced in v0.4.x. | [requirements.md](spec/requirements.md) |
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
| **Interceptor** | A NestJS construct that wraps route handlers to add extra logic (logging, transformation, caching). Not yet used in the project. | -- |
| **Module** | A NestJS organisational unit that groups related controllers, services, and providers. KC-Project has 5 domain modules + AppModule. | [ADR-007](decisions/ADR-007-five-domain-split.md) |
| **RSC** | React Server Components. A Next.js feature where components render on the server by default. KC-Project uses `'use client'` on all pages instead. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **BFF** | Backend For Frontend. A pattern where the frontend's server (e.g. Next.js) proxies API calls, hiding the real backend from the browser. Not used in v1.0.0. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **SPA** | Single-Page Application. A web application where the browser loads a single HTML page and dynamically updates it via JavaScript. KC-Project's frontend behaves as an SPA. | [ADR-011](decisions/ADR-011-client-side-rendering.md) |
| **OpenAPI** | A specification for describing REST APIs in a machine-readable format (JSON/YAML). The backend generates an OpenAPI spec via `@nestjs/swagger`. | [ADR-018](decisions/ADR-018-swagger-cli-plugin.md) |
| **ERD** | Entity Relationship Diagram. A visual representation of database entities and their relationships. | [data-model.md](architecture/data-model.md) |

---

## Project Terms

| Term | Definition | Reference |
|------|-----------|-----------|
| **Attack surface** | The set of points where an attacker can interact with a system. KC-Project defines 6 surfaces: Identity, Data, Injection, File, Authorization, Infrastructure. | [threat-model.md](diagrams/threat-model.md) |
| **Trust boundary** | A line where the level of trust changes. In KC-Project, the primary trust boundary is between the browser (untrusted) and the backend API. | [ARCHITECTURE.md](architecture/ARCHITECTURE.md) |
| **Expansion cycle** | The perpetual v1.N.0 (insecure) -> v1.N.x (pentest) -> v2.N.0 (secure) -> v1.N+1.0 (new insecure) loop. | [ADR-013](decisions/ADR-013-expansion-cycle-versioning.md) |
| **Insecure-by-design** | The project philosophy of introducing security weaknesses deliberately, then discovering and fixing them through structured pentesting. | [ADR-006](decisions/ADR-006-insecure-by-design.md) |
| **Security baseline** | The set of security controls that must be implemented for a version to qualify as v2.N.0 (hardened). | [security-baseline.md](spec/security-baseline.md) |
| **Pentest cycle** | The v1.N.x phase where the insecure baseline is systematically tested, findings documented, and patches applied. | [ADR-013](decisions/ADR-013-expansion-cycle-versioning.md) |
| **ADR** | Architecture Decision Record. A document capturing a specific technical decision with context, rationale, and consequences. | [decisions/](decisions/) |
