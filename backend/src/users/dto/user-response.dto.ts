/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Response shape for GET /users/read, GET /users/get/:id, and for create/update
 * responses. Stub only; data is mock. No persistence. We do not expose
 * password in response (only id, email, username, createdAt).
 *
 * --- Why no password in response? ---
 * Even in stub form, the contract should not return secrets. Real APIs
 * never send password back; establishing that in the DTO now avoids mistakes
 * when we add persistence.
 */
export class UserResponseDto {
  id: string;
  email?: string;
  username?: string;
  createdAt: string;
}
