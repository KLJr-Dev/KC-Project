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
- **Goals:** Register an account, log in, upload and manage files, create and search **notes**, create sharing links, view own profile
- **Actions:**
  - `POST /auth/register` — create account
  - `POST /auth/login` — authenticate
  - `GET /auth/me` — view own profile
  - `POST /files` — upload file
  - `GET /files/:id` — view file metadata
  - `DELETE /files/:id` — delete own file
  - `POST /notes` — create note (optional attachment)
  - `GET /notes`, `GET /notes/:id` — list/search/read own notes
  - `PUT /notes/:id`, `DELETE /notes/:id` — update/delete own notes
  - `POST /sharing` — create sharing link
  - `GET /sharing/:id` — view sharing details
- **Trust level:** Authenticated but unprivileged. Should only access own resources (Notes RBAC enforces this on SoftDev tip).
- **UI:** `/files`, `/notes`, `/sharing`

### Moderator User

- **Description:** Intermediate role for content moderation (file approval workflow)
- **Access level:** Authenticated, `moderator` role
- **Demo account:** `mod@kc.test` / `ModPass123!` (seeded, see [demo-users.md](../deploy/demo-users.md))
- **Goals:** Review pending file uploads; **flag notes** for review; approve or reject files
- **Actions:** Regular User actions, plus:
  - `PUT /files/:id/approve` — approve or reject files
  - `GET /notes` — list **all** notes (privileged)
  - `PUT /notes/:id/flag` — flag/unflag notes
  - (Cannot delete other users’ notes — admin only)
  - `PUT /admin/users/:id/role/escalate` — promote users to moderator (historical CWE-269 on v1.0.0)
- **Trust level:** Elevated over regular users
- **UI:** `/notes` (all), `/moderator`

### Admin User

- **Description:** A privileged user with administrative access
- **Access level:** Authenticated, `admin` role
- **Demo account:** `admin@kc.test` / `AdminPass123!`
- **Goals:** View all users, modify user roles, view stats and audit logs, **read/delete any note** (incl. ops bastion plant)
- **Actions:** All Regular User actions, plus:
  - `GET /admin/users` — list/search users
  - `PUT /admin/users/:id/role` — modify user roles
  - `GET /admin/stats`, `GET /admin/audit-logs`
  - `GET /notes`, `DELETE /notes/:id` — privileged note access
- **Trust level:** Elevated privileges
- **SoftDev tip:** Seeded admin ops note holds real SSH material (examiner GT)

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
| Identity | Brute-force login, forge JWTs (historical), enumerate users, replay tokens |
| Data | IDOR via sequential IDs, access other users' resources |
| File | Path traversal / MIME confusion (historical insecure tips) |
| **Notes (SoftDev)** | Stored XSS via HTML/MD render; SVG/HTML attachment inline; steal mod/admin session → read ops note → SSH |
| Authorization | Call privileged endpoints as regular user (historical); Notes flag without mod role |
| Infrastructure | SSH foothold on overlay `:2222`; published DB on older CTF boxes only |

---

## Persona-Surface Matrix

Which personas interact with which attack surfaces:

| Persona | Identity | Data | File | Notes | Authorization | Infrastructure |
|---------|----------|------|------|-------|---------------|----------------|
| Regular User | Register, login | Own data | Own files | Own notes | User-level | -- |
| Moderator User | Same | Pending queue | Approve/reject | All notes + flag | Mod endpoints | -- |
| Admin User | Same | All users | All files | All notes + delete | Admin functions | -- |
| Unauthenticated | Registration, login | Public shares | Public downloads | -- | -- | -- |
| Attacker | Auth attacks | IDOR | Traversal/MIME | XSS → priv note → SSH | Escalation gaps | SSH overlay / CTF overlays |
