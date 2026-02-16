/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Response shape for POST /auth/register and POST /auth/login. Stub only;
 * no real token or persistence. Same shape for both so clients can treat
 * “successful auth” uniformly (e.g. store token, redirect).
 *
 * --- Why one response for register and login? ---
 * Both endpoints typically return a session indicator (token or session id).
 * Using one DTO keeps the contract simple; we can split later if register
 * needs to return extra fields (e.g. emailVerified). token is a placeholder
 * until v0.1.3 (sessions/JWT).
 */
export class AuthResponseDto {
  token!: string;
  userId!: string;
  message?: string;
}
