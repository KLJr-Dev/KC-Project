# Requirements

Functional, non-functional, and security requirements for KC-Project. Each requirement is tagged with the roadmap version it is introduced, making it traceable across the build phase.

---

## Functional Requirements

### FR-1: User Management

| ID | Requirement | Version |
|----|-------------|---------|
| FR-1.1 | The system shall allow users to register an account with email, username, and password | v0.1.1 |
| FR-1.2 | The system shall reject registration when required fields are missing | v0.1.1 |
| FR-1.3 | The system shall detect and reject duplicate email registrations | v0.1.1 |
| FR-1.4 | The system shall allow registered users to authenticate with email and password | v0.1.2 |
| FR-1.5 | The system shall maintain authenticated session state via tokens | v0.1.3 |
| FR-1.6 | The system shall allow authenticated users to view their own profile | v0.1.3 |
| FR-1.7 | The system shall persist user data across application restarts | v0.2.0 |
| FR-1.8 | The system shall store user credentials in the database | v0.2.1 |

### FR-2: Role Management

| ID | Requirement | Version |
|----|-------------|---------|
| FR-2.1 | The system shall support at least two user roles: regular user and admin | v0.4.0 |
| FR-2.2 | The system shall associate each user with a role at creation time | v0.4.0 |
| FR-2.3 | The system shall expose role-based functionality (admin-only endpoints) | v0.4.1 |
| FR-2.4 | The system shall allow administrators to modify user roles | v0.4.1 |

### FR-3: File Management

| ID | Requirement | Version |
|----|-------------|---------|
| FR-3.1 | The system shall allow authenticated users to upload files | v0.3.0 |
| FR-3.2 | The system shall store file metadata (filename, MIME type, size, owner) | v0.3.1 |
| FR-3.3 | The system shall allow users to view metadata of their uploaded files | v0.3.1 |
| FR-3.4 | The system shall allow users to download files by identifier | v0.3.2 |
| FR-3.5 | The system shall allow users to delete files they own | v0.3.3 |
| FR-3.6 | The system shall store uploaded file contents on the local filesystem | v0.3.0 |

### FR-4: File Sharing

| ID | Requirement | Version |
|----|-------------|---------|
| FR-4.1 | The system shall allow users to generate file-sharing links | v0.3.4 |
| FR-4.2 | The system shall support public (unauthenticated) access to shared files | v0.3.4 |
| FR-4.3 | The system shall distinguish between public and private resources | v0.3.4 |
| FR-4.4 | The system shall associate sharing links with the creating user | v0.3.4 |

### FR-5: Administrative Functions

| ID | Requirement | Version |
|----|-------------|---------|
| FR-5.1 | The system shall provide administrative access to privileged users | v0.4.1 |
| FR-5.2 | The system shall allow administrators to view all user accounts | v0.4.1 |
| FR-5.3 | The system shall allow administrators to modify user roles | v0.4.1 |
| FR-5.4 | The system shall allow administrators to view system-wide file data | v0.4.1 |

---

## Non-Functional Requirements

### NFR-1: Usability

| ID | Requirement | Version |
|----|-------------|---------|
| NFR-1.1 | The system shall provide a web-based user interface | v0.0.4 |
| NFR-1.2 | The interface shall be accessible via modern web browsers (Chrome, Firefox, Safari, Edge) | v0.0.4 |
| NFR-1.3 | The interface shall visually distinguish between user roles where applicable | v0.4.2 |
| NFR-1.4 | The interface shall support light and dark themes | v0.0.4 |

### NFR-2: Maintainability

| ID | Requirement | Version |
|----|-------------|---------|
| NFR-2.1 | The system shall use a modular backend architecture (per-domain modules) | v0.0.6 |
| NFR-2.2 | The codebase shall be version-controlled using Git | v0.0.1 |
| NFR-2.3 | Changes shall be traceable across versions via commit history and tags | v0.0.1 |
| NFR-2.4 | TypeScript strict mode shall be enabled on both frontend and backend | v0.0.8 |
| NFR-2.5 | Code formatting shall be enforced via shared Prettier configuration | v0.0.8 |
| NFR-2.6 | Architecture decisions shall be documented as ADRs | v0.0.2 |

### NFR-3: Deployability

| ID | Requirement | Version |
|----|-------------|---------|
| NFR-3.1 | The system shall be deployable on a Linux-based server (Ubuntu VM) | v0.6.0 |
| NFR-3.2 | The system shall support containerised deployment via Docker | v0.5.0 |
| NFR-3.3 | The system shall use docker-compose for multi-container orchestration | v0.5.0 |
| NFR-3.4 | The system shall allow multiple versions to coexist conceptually (via Git tags and branches) | v0.0.1 |

### NFR-4: Testability

| ID | Requirement | Version |
|----|-------------|---------|
| NFR-4.1 | The system shall expose all functionality via a RESTful API | v0.0.6 |
| NFR-4.2 | The system shall be testable using automated tools (Jest, Supertest) | v0.0.3 |
| NFR-4.3 | The system shall be testable using manual security tools (Burp Suite, curl, OWASP ZAP) | v0.5.0 |
| NFR-4.4 | The system shall generate an OpenAPI specification for API exploration | v0.0.8 |

---

## Security Requirements

### SR-1: v1.0.0 Security Position

The system is **not required to meet production security standards** in v1.0.0. This is intentional per [ADR-006](../decisions/ADR-006-insecure-by-design.md).

| ID | Requirement | Version |
|----|-------------|---------|
| SR-1.1 | Security controls may be incomplete or absent in v1.0.0 | v1.0.0 |
| SR-1.2 | Vulnerabilities are considered acceptable within the project scope | v1.0.0 |
| SR-1.3 | All intentional weaknesses shall be documented with CWE and OWASP Top 10 classification | v1.0.0 |
| SR-1.4 | The system shall be deployed in a controlled, isolated environment only | v1.0.0 |
| SR-1.5 | No real user data shall be processed | All |

### SR-2: v2.0.0 Security Position

Hardened counterparts shall implement proper security controls. See [security-baseline.md](security-baseline.md) for the full control checklist.

| ID | Requirement | Version |
|----|-------------|---------|
| SR-2.1 | The system shall implement proper password hashing (bcrypt, cost 12+) | v2.0.0 |
| SR-2.2 | The system shall enforce token expiration and refresh rotation | v2.0.0 |
| SR-2.3 | The system shall enforce server-side authorisation on all protected endpoints | v2.0.0 |
| SR-2.4 | The system shall validate and sanitise all user input | v2.0.0 |
| SR-2.5 | The system shall enforce file upload validation (MIME, size, path) | v2.0.0 |
| SR-2.6 | The system shall use TLS for all client-server communication | v2.0.0 |
| SR-2.7 | The system shall implement structured logging with sensitive field redaction | v2.0.0 |
| SR-2.8 | The system shall run containers as non-root with resource limits | v2.0.0 |
| SR-2.9 | The system shall implement rate limiting on authentication endpoints | v2.0.0 |
| SR-2.10 | The system shall use a reverse proxy (nginx) with security headers | v2.0.0 |

---

## Requirements Traceability

Requirements map to roadmap versions as follows:

| Roadmap Phase | Requirement Groups |
|---------------|-------------------|
| v0.0.x Foundation | NFR-1.1, NFR-1.2, NFR-1.4, NFR-2.1-2.6, NFR-3.4, NFR-4.1-4.2, NFR-4.4 |
| v0.1.x Identity | FR-1.1-1.6 |
| v0.2.x Persistence | FR-1.7-1.8 |
| v0.3.x Files | FR-3.1-3.6, FR-4.1-4.4 |
| v0.4.x Authorization | FR-2.1-2.4, FR-5.1-5.4, NFR-1.3 |
| v0.5.x Deployment | NFR-3.1-3.3, NFR-4.3 |
| v1.0.0 Insecure MVP | SR-1.1-1.5 |
| v2.0.0 Secure Parallel | SR-2.1-2.10 |
