/**
 * Auth success response — access JWT + refresh token (v2.0.0).
 */
export class AuthResponseDto {
  /** Short-lived access JWT (Bearer). */
  token!: string;
  /** Opaque refresh token; rotated on use; revoked on logout. */
  refreshToken!: string;
  userId!: string;
  message?: string;
}
