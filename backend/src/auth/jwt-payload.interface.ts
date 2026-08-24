/**
 * Decoded access-JWT payload (v2.1.0).
 *
 * Used by JwtAuthGuard and @CurrentUser. `role` may be present for UX but
 * HasRoleGuard reloads role from the DB — JWT role is non-authoritative.
 *
 * Historical (v1.0.0): JWT role trusted for authz; sequential `sub` guessable.
 * Residual: sequential string IDs (accepted — see Cycle residuals).
 */
export interface JwtPayload {
  sub: string;
  role?: 'user' | 'moderator' | 'admin';
  iat?: number;
}
