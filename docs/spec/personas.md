# Stakeholders and Personas

Defines who interacts with KC-Project and in what capacity. Stakeholders operate on the project itself; personas operate within the application.

---

## Primary Stakeholders

People who work on, test, or learn from the project.

### Developer

- **Role:** Builds the system incrementally per the roadmap
- **Goals:** Implement realistic web application features, introduce intentional security weaknesses at the right versions, maintain clean architecture and documentation
- **Activities:** Writing code, creating ADRs, updating architecture docs, running tests
- **Tooling:** IDE, Git/GitHub, Node.js, Docker
- **Cycle-1 artifacts:** [Dev/v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md), [cwe-inventory.md](../security/cwe-inventory.md)

### Penetration Tester

- **Role:** Discovers and exploits weaknesses in each v1.N.0 insecure baseline
- **Goals:** Identify all intentional (and unintentional) vulnerabilities, document findings with reproducible steps, validate that the threat model is accurate
- **Activities:** Manual testing (browser DevTools, curl), automated scanning (Burp Suite, OWASP ZAP, nmap, sqlmap), writing pentest reports
- **Tooling:** Kali Linux or equivalent, Burp Suite, OWASP ZAP, custom scripts; deploy via `docker-compose.prod.yml` at `:8080`
- **Cycle-1 artifacts:** [PenTest/v1.0.0-writeup.md](../security/Cycle-1/PenTest/v1.0.0-writeup.md), [pentest-journeys.md](../deploy/pentest-journeys.md), [demo-users.md](../deploy/demo-users.md)
- **Note:** May be the same person as the Developer. Test `/dev/*` and API directly — product UI client-filters hide IDOR from casual browsing.

### Security Engineer

- **Role:** Remediates weaknesses discovered during v1.N.x testing to produce v2.N.0
- **Goals:** Apply security controls that address each documented CWE, verify that remediations are effective, document the delta between insecure and secure versions
- **Activities:** Code hardening, infrastructure configuration, writing security tests, updating threat model
- **Tooling:** Same as Developer, plus security-specific tools for verification
- **Cycle-1 artifacts:** [Remediation/v2.0.0-remediation.md](../security/Cycle-1/Remediation/v2.0.0-remediation.md), [security-baseline.md](security-baseline.md)
- **Note:** May be the same person as the Developer and Pentester. The three roles represent the full secure SDLC cycle.

---

## In-App User Personas

People (or agents) who interact with the running application.

### Regular User

- **Description:** A registered user of the application with standard privileges
- **Access level:** Authenticated, `user` role
- **Goals:** Register an account, log in, upload and manage files, create sharing links, view own profile
- **Actions:**
  - `POST /auth/register` — create account
  - `POST /auth/login` — authenticate
  - `GET /auth/me` — view own profile
  - `POST /files` — upload file
  - `GET /files/:id` — view file metadata
  - `DELETE /files/:id` — delete own file
  - `POST /sharing` — create sharing link
  - `GET /sharing/:id` — view sharing details
- **Trust level:** Authenticated but unprivileged. Should only access own resources.

### Moderator User

- **Description:** Intermediate role for content moderation (file approval workflow)
- **Access level:** Authenticated, `moderator` role
- **Demo account:** `mod@kc.test` / `ModPass123!` (seeded, see [demo-users.md](../deploy/demo-users.md))
- **Goals:** Review pending file uploads, approve or reject files
- **Actions:** Regular User actions, plus:
  - `PUT /files/:id/approve` — approve or reject files
  - `PUT /admin/users/:id/role/escalate` — promote users to moderator (CWE-269)
- **Trust level:** Elevated over regular users but hierarchy vs admin is ambiguous (CWE-841)

### Admin User

- **Description:** A privileged user with administrative access
- **Access level:** Authenticated, `admin` role
- **Demo account:** `admin@kc.test` / `AdminPass123!`
- **Goals:** View all users, modify user roles, view stats and audit logs
- **Actions:** All Regular User actions, plus:
  - `GET /admin/users` — list/search users
  - `PUT /admin/users/:id/role` — modify user roles
  - `GET /admin/stats`, `GET /admin/audit-logs`
- **Trust level:** Elevated privileges. Should have access to administrative functions that regular users cannot reach.
- **v1.0.0 weakness:** Some admin endpoints inconsistently guarded (CWE-862); JWT role trusted (CWE-639)

### Unauthenticated Visitor

- **Description:** Someone who has not logged in
- **Access level:** No authentication, no role
- **Goals:** View public shared files, register an account, log in
- **Actions:**
  - `GET /sharing/:id` — access publicly shared file (if sharing link exists)
  - `POST /auth/register` — create account
  - `POST /auth/login` — authenticate
  - `GET /ping` — verify system is running
- **Trust level:** Untrusted. Should only access public resources and auth endpoints.

### Attacker (Implicit Persona)

- **Description:** An adversarial actor attempting to exploit the system. Not a designed user role — represents the threat model's perspective.
- **Access level:** Varies. May be unauthenticated, authenticated as a regular user, or have stolen credentials/tokens.
- **Goals:** Escalate privileges, access other users' data, bypass authentication, exploit infrastructure weaknesses, exfiltrate sensitive information
- **Attack vectors by surface:**

| Surface | Example attacks |
|---------|----------------|
| Identity | Brute-force login (no rate limiting), forge JWTs (weak secret), enumerate users (distinct errors), replay tokens (no revocation) |
| Data | IDOR via sequential IDs, access other users' resources by guessing IDs, SQL injection |
| File | Path traversal to read arbitrary files, upload malicious MIME types, access files without ownership |
| Authorization | Call admin endpoints as regular user, spoof role claims, escalate via missing guards |
| Infrastructure | Connect directly to exposed database, read logs for sensitive data, exploit root containers |

---

## Persona-Surface Matrix

Which personas interact with which attack surfaces:

| Persona | Identity | Data | File | Authorization | Infrastructure |
|---------|----------|------|------|---------------|---------------|
| Regular User | Register, login, session | Own data CRUD (UI) / all (API) | Own files (UI) / all (API) | User-level access | -- |
| Moderator User | Same as regular | Pending queue (UI) | Approve/reject | Mod endpoints + escalation | -- |
| Admin User | Same as regular | All users' data | All files | Admin functions | -- |
| Unauthenticated | Registration, login | Public shared files | Public downloads | -- | -- |
| Attacker | All auth attacks | IDOR, injection | Traversal, MIME | Escalation, guard gaps | nginx, DB creds, containers |
