# ADR-025: Role-Based Access Control (RBAC) Strategy

**Status:** Accepted

**Date:** v0.4.0 (Roles Introduced)

---

## Context

KC-Project's v0.4.x introduces the Authorization & Administrative Surface. This surface must introduce privilege boundaries in a learnable, exploitable way that teaches both:

1. How to build insecure RBAC systems (v0.4.0–v0.4.5)
2. How those insecurities manifest as privilege escalation attacks
3. What the remediated versions should look like (future v2.4.x)

The key decision was whether to introduce:
- **2 roles (User / Admin)** — binary escalation, simpler attack surface
- **3+ roles (User / Moderator / Admin)** — role confusion, horizontal escalation, complexity

## Decision

Implement a **progressive multi-role system** starting with 2 roles in v0.4.0 and expanding to 3 roles in v0.4.3:

### v0.4.0–v0.4.2: Binary System (User / Admin)

- Simple vertical escalation attack surface
- Isolates the concept of role-based access without multi-role complexity
- Allows focused attention on JWT role claim abuse and weak guard logic
- Easier to teach in isolation

### v0.4.3–v0.4.5: Ternary System (User / Moderator / Admin)

- Introduces horizontal escalation and role confusion
- Moderator role creates ambiguity: is it "higher" than admin for moderation decisions?
- Endpoints accidentally granted to wrong roles
- Privilege escalation chains become possible (user → moderator → admin)

### Core Design Principles

#### Principle 1: Client-Controlled Role Claims (v0.4.0)

- `role` claim stored in JWT payload and never re-validated server-side during v0.4.0–v0.4.2
- Client can forge JWT with `role: 'admin'` (leveraging hardcoded JWT secret from v0.1.3)
- Guard checks JWT role claim without verifying against database
- **CWE-639 (Client-Controlled Authorization)** is the foundational vulnerability

#### Principle 2: Weak Guard Implementation (v0.4.2)

- `@HasRole('admin')` guard introduced, but trusts JWT payload
- No database lookup to verify current user's actual role
- Guards check `jwt.payload.role` not `User.role` from database
- Vulnerable to token tampering and privilege escalation

#### Principle 3: Multi-Role Ambiguity (v0.4.3)

- `@HasRole('moderator', 'admin')` decorator accepts both roles
- No clear role hierarchy or permission model
- Endpoints accidentally granted to moderators (intended for admins only)
- Role confusion attacks become viable (CWE-639 expanded)

#### Principle 4: Incremental Expansion

- Each v0.4.x patch introduces new endpoints and new ways to break them
- v0.4.1 adds endpoints with no guards (CWE-862)
- v0.4.2 adds weak guards (CWE-639)
- v0.4.3 adds role confusion (CWE-639 expanded)
- v0.4.4 adds cross-role IDOR (CWE-639 + CWE-200)
- v0.4.5 adds escalation chains (CWE-640, CWE-200)

## Alternatives Considered

### Alternative 1: More Roles Earlier (User / Guest / Moderator / Content Manager / Admin)

**Rejected because:**
- Too much complexity in v0.4.0 — harder to isolate individual vulnerabilities
- Violates the project's philosophy of "incremental delivery"
- Role confusion would bury the simpler JWT claim abuse lesson
- Would require 5x more guard logic to introduce incrementally

### Alternative 2: Fewer Roles (Just User / Admin, never introduce Moderator)

**Rejected because:**
- Limits attack surface to simple vertical escalation
- Misses opportunity to teach role confusion (CWE-639 horizontal variant)
- Less realistic to real-world scenarios (most apps have 3+ role levels)
- v0.4.x would be artificially small

### Alternative 3: Permissions-Based (not Role-Based)

**Rejected because:**
- Over-engineered for v0.4.x scope
- Permissions model obscures the role escalation lesson
- Can be introduced in v1.1.x expansion cycle with more depth
- RBAC is simpler to exploit and teach

## Consequences

### Positive

- **Incremental complexity:** Start simple (binary), expand to complexity (ternary)
- **Clear teaching arc:** JWT claim abuse → weak guards → role confusion → escalation chains
- **Mapped to roadmap:** Each v0.4.x patch adds a discrete lesson about authorization failure
- **Realistic vulnerabilities:** Role confusion and IDOR-across-roles mirror real-world RBAC bugs
- **Exploitable progressively:** Penetration testing can target each version's specific surface

### Negative

- **Multi-role expansion in v0.4.3:** Requires migration and schema change; complexity bump mid-surface
- **Guard complexity:** `@HasRole('moderator', 'admin')` is more error-prone than single-role checks
- **Testing burden:** More combinations to test as roles expand
- **Documentation overhead:** Must clearly explain role hierarchy and explain why it's broken

### Neutral

- **Not changing roles again:** Once 3 roles introduced in v0.4.3, they stay until v2.4.x (secure parallel)
- **No permission matrix:** Pure role-to-endpoint mapping, no permission subsetting

## Implementation Checklist

- [ ] Add `role` enum to `User` entity (v0.4.0)
- [ ] Add migration `AddRoleToUser` (v0.4.0)
- [ ] Update JWT payload to include role (v0.4.0)
- [ ] Create admin endpoints without guards (v0.4.1)
- [ ] Introduce `@HasRole('admin')` guard (v0.4.2)
- [ ] Add migration `AddModeratorRole` (v0.4.3)
- [ ] Add moderator endpoints (v0.4.3)
- [ ] Update guards to support multi-role (v0.4.3)
- [ ] Add cross-role endpoints (v0.4.4)
- [ ] Add escalation chain endpoints (v0.4.5)
- [ ] Document all CWEs and attack paths (v0.4.5)

## Future: v2.4.x Hardening

When the secure parallel (v2.4.x) is built, it will:

- Validate `role` from database on every request, not from JWT
- Implement explicit role hierarchy (User < Moderator < Admin)
- Use permission-based checks (not role-based) for fine-grained control
- Add role audit logging
- Implement secure role transition workflows
- Validate guards at multiple layers (controller, service, data access)

See ADR-025-secure-rbac (future) for the v2.4.x approach.
