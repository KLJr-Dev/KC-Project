/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for POST /users/create. Stub only; validation minimal/absent.
 * Fields define the contract for user creation. Real validation and
 * persistence come in v0.1.x / v0.2.x.
 *
 * --- Why a dedicated Create DTO? ---
 * Same pattern as admin: request shape is explicit. User creation typically
 * needs identifier fields (email, username) and secret (password). We keep
 * them optional here for v0.0.6 contract-only; class-validator can enforce
 * required later.
 */
export class CreateUserDto {
  email?: string;
  username?: string;
  password?: string;
}
