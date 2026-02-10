/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for PUT /users/update/:id. Partial shape; validation
 * minimal/absent. Clients send only fields they want to change.
 *
 * --- Why separate from CreateUserDto? ---
 * Update often allows partial payloads and may exclude sensitive fields
 * (e.g. password change on a different endpoint). Dedicated DTO keeps
 * the contract clear. Same shape as create for simplicity in v0.0.6.
 */
export class UpdateUserDto {
  email?: string;
  username?: string;
  password?: string;
}
