/**
 * M6 / v2.0.0 — Auth success response.
 *
 * Access JWT is returned in JSON for the SPA memory store.
 * Refresh token is delivered via httpOnly Set-Cookie only (not in body) —
 * CWE-922: JS / XSS must not be able to read the refresh secret from the
 * response payload. Optional `refreshToken` remains on the type for internal
 * service use before the controller strips it.
 */
export class AuthResponseDto {
  /** Short-lived access JWT (Bearer) — client keeps in memory only. */
  token!: string;
  /**
   * Opaque refresh token. Set on the httpOnly cookie by AuthController;
   * omitted from the HTTP JSON body for browser clients.
   */
  refreshToken?: string;
  userId!: string;
  message?: string;
}
