/**
 * M5 / v2.0.0 — Explicit role hierarchy (security-baseline CWE-841).
 *
 * Security measures:
 * - CWE-841: Ternary roles (user / moderator / admin) had no rank constants,
 *   so “who may promote whom” was ambiguous and easy to get wrong in services.
 * - CWE-269 / CWE-862: Callers must use assertCanAssignRole / canEscalateTo
 *   before mutating roles; never trust JWT role alone for the check — pass the
 *   actor role already loaded from the DB (HasRoleGuard / admin path).
 *
 * Rank rules (strict):
 * - Higher number = more privilege.
 * - An actor may assign a role only if actorRank >= newRoleRank
 *   (admin may create/demote other admins; moderator cannot assign admin).
 * - Escalate endpoint only promotes user → moderator, and only when the actor
 *   outranks the target role after promotion (admin only in practice).
 */
export const ROLE_RANK = {
  user: 1,
  moderator: 2,
  admin: 3,
} as const;

export type AppRole = keyof typeof ROLE_RANK;

export const APP_ROLES: readonly AppRole[] = ['user', 'moderator', 'admin'];

/** Numeric rank for a role string; unknown roles rank 0 (least privilege). */
export function roleRank(role: string | null | undefined): number {
  if (!role || !(role in ROLE_RANK)) {
    return 0;
  }
  return ROLE_RANK[role as AppRole];
}

export function isAppRole(value: string): value is AppRole {
  return value in ROLE_RANK;
}

/**
 * Whether `actorRole` is allowed to set a subject to `newRole`.
 * Requires actor rank >= new role rank (peers of equal rank OK for admin→admin).
 */
export function canAssignRole(actorRole: string, newRole: string): boolean {
  return roleRank(actorRole) >= roleRank(newRole) && roleRank(newRole) > 0;
}

/**
 * Escalate path: only user → moderator, and only if actor outranks moderator.
 * (Admin rank 3 > moderator 2; moderator cannot escalate peers.)
 */
export function canEscalateUserToModerator(actorRole: string, currentTargetRole: string): boolean {
  return (
    currentTargetRole === 'user' &&
    roleRank(actorRole) > ROLE_RANK.moderator &&
    canAssignRole(actorRole, 'moderator')
  );
}
