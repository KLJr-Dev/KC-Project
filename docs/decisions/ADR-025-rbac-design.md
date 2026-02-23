# ADR-025: Role-Based Access Control (RBAC) Design & Permission Enforcement Gaps

**Date**: February 2026  
**Status**: DECIDED (v0.4.x implementation)  
**Context**: Authorization surface for KC-Project, versions v0.4.0 through v0.4.5

---

## Problem

KC-Project requires a permission model to separate regular users from administrators. The system should demonstrate intentional authorization weaknesses for security learning and penetration testing scenarios.

---

## Decision

Implement role-based access control (RBAC) in three phases:

### Phase 1 (v0.4.0–v0.4.2): Binary RBAC with Client-Controlled Authorization

- **Role Set**: `{ 'user', 'admin' }`
- **Implementation**: `role` column on User entity; `role` claim in JWT payload
- **Guard**: `HasRoleGuard` trusts JWT role without database re-validation
- **Vulnerability Focus**: **CWE-639** (Client-Controlled Authorization)
  - JWT secret is hardcoded as `'kc-secret'`
  - Attacker can forge JWT with fake role claim
  - HAP admin access without database record
- **Endpoints**:
  - v0.4.1: GET /admin/users, PUT /admin/users/:id/role (both guarded)

### Phase 2 (v0.4.3): Ternary Roles with Hierarchy Ambiguity

- **Role Set**: `{ 'user', 'moderator', 'admin' }`
- **New Role**: `'moderator'` — intermediate permission level
- **Vulnerability Focus**: **CWE-841** (Improper Restriction of Rendered UI Layers)
  - Three roles with undefined hierarchy
  - No explicit precedence constants (e.g., `ADMIN_RANK > MODERATOR_RANK > USER_RANK`)
  - `@HasRole(['moderator', 'admin'])` treats as equals
  - Ambiguous permission inheritance
- **New Endpoints**:
  - PUT /files/:id/approve (guarded by `@HasRole(['moderator', 'admin'])`)
- **Frontend**: Ternary role selector dropdown

### Phase 3 (v0.4.4–v0.4.5): Escalation & Missing Authorization

- **v0.4.4**: Privilege escalation endpoint
  - **Vulnerability Focus**: **CWE-269** (Improper Access Control — Privilege Escalation)
  - New endpoint: PUT /admin/users/:id/role/escalate
  - Moderators can promote users to moderator (horizontal escalation)
  - Newly promoted moderators can immediately escalate others (cascading chain)
  - Attack: User A → Moderator B → Moderator C → ... exponential growth

- **v0.4.5**: Inconsistent authorization enforcement
  - **Vulnerability Focus**: **CWE-862** (Improper Access Control — Missing Authorization Check)
  - New endpoint: DELETE /admin/users/:id
  - **Intentionally missing** `@HasRole('admin')` decorator
  - Only guarded by `JwtAuthGuard` (authentication, not authorization)
  - Any authenticated user (regular, moderator, admin) can delete any other user
  - Demonstrates real-world developer oversight: guards added inconsistently across endpoints

---

## Rationale

### Why Client-Controlled Authorization (CWE-639)?

Learning goal: Demonstrate that **trusting client-provided claims without server-side validation is fatal**. JWT signatures prove origin, not content truthfulness. A forged role claim can grant unauthorized access if not re-validated in the database.

### Why Ternary Roles (CWE-841)?

Learning goal: Show that **ambiguous permission models create confusion and exploitability**. Systems with multiple role levels must define explicit hierarchy (e.g., via ranking constants). Absence of hierarchy allows attackers to reason about permission inheritance incorrectly.

### Why Escalation Chains (CWE-269)?

Learning goal: Demonstrate **role delegation gone wrong**. If person B can make person C a peer, and C can make D a peer, the system should limit the depth or require explicit approval. In KC-Project, the absence of checks allows exponential escalation.

### Why Inconsistent Guards (CWE-862)?

Learning goal: Real codebases have inconsistency — some endpoints guarded, some not — due to developer oversight or refactoring. The DELETE endpoint missing `@HasRole` is realistic: developers think "all admin endpoints are in AdminController, so they're all guarded" but forget that `HasRoleGuard` only blocks if `@HasRole` metadata exists.

---

## Alternatives Considered

1. **No RBAC at all (all endpoints public)**: Too abstract, doesn't teach guard patterns.
2. **Perfect RBAC implementation**: Defeats the learning goal — students need to spot why authorization is insufficient.
3. **Multiple guard patterns**: Could introduce other guard types (ownership-based, resource-based). Kept simple for v0.4.x to focus on role-based depth.

---

## Consequences

### Positive

- Student can observe realistic authorization vulnerabilities in a coherent system state
- Can forge JWTs to demonstrate CWE-639 and gain unauthorized access
- Can escalate privilege via chain attacks to understand CWE-269
- Can find missing guards (CWE-862) by testing all endpoints
- Transitions smoothly to v0.5.x (file handling) where authorization is further tested

### Negative

- System is intentionally insecure — not suitable for production or real data
- Authorization logic is not re-usable as-is; remediation required for v2.0.0
- Inconsistency may confuse developers expecting a secure baseline

---

## Implementation Notes

### Guard Stacking Order

```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, HasRoleGuard)
export class AdminController {
  @Get('users')
  @HasRole('admin')
  async getAllUsers() { ... }

  @Delete('users/:id')
  // No @HasRole — HasRoleGuard sees no metadata, allows access
  async deleteUser(@Param('id') userId) { ... }
}
```

**Order matters**: JwtAuthGuard runs first (authentication), HasRoleGuard second (authorization). If JwtAuthGuard passes, execution reaches HasRoleGuard.

### HasRoleGuard Logic

```typescript
const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());

if (!requiredRoles || requiredRoles.length === 0) {
  // No @HasRole metadata found → implicit allow
  return true;
}

// Compare JWT role against required roles
const user = context.switchToHttp().getRequest().user;
return requiredRoles.includes(user.role);
```

### Database vs. JWT Role Source of Truth

**Design Decision**: JWT role is trusted without re-validation. This is **intentional** (CWE-639).

In production (v2.0.0 remediation):
- Load user from database on every protected request
- Compare database `user.role` against required roles
- Log authorization checks to audit trail

---

## E2E Tests

- **v0.4.2**: `rbac.e2e-spec.ts` — 6 tests covering JWT forgery, role changes, guard behavior
- **v0.4.3**: `files-approval.e2e-spec.ts` — 7 tests covering moderator approvals, role confusion
- **v0.4.4**: `escalation.e2e-spec.ts` — 4 tests covering escalation chains, audit logs
- **v0.4.5**: `inconsistency.e2e-spec.ts` — 5 tests covering missing guards, authorization bypass

Total: 22 RBAC-specific e2e tests across v0.4.x.

---

## Open Questions

1. Should v0.4.x include audit logging (CWE-532)? → Placeholder only, no persistence
2. Should rate limiting prevent escalation spam? → No, intentionally absent
3. Should soft-delete replace hard-delete on DELETE endpoint? → Hard-delete to maximize vulnerability surface

---

## Related ADRs

- ADR-012: JWT over Sessions
- ADR-023: Error Handling Philosophy

---

## References

- CWE-639: Client-Controlled Authorization Mechanism (https://cwe.mitre.org/data/definitions/639.html)
- CWE-841: Improper Enforcement of Behavioral Workflow (https://cwe.mitre.org/data/definitions/841.html)
- CWE-269: Improper Access Control (Generic) (https://cwe.mitre.org/data/definitions/269.html)
- CWE-862: Missing Authorization (https://cwe.mitre.org/data/definitions/862.html)
- OWASP A07:2021 – Identification and Authentication Failures
- OWASP A01:2021 – Broken Access Control
