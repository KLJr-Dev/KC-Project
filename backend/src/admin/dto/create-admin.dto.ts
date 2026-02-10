/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for POST /admin/create. Stub only; validation minimal/absent.
 * Fields define the contract, not behaviour.
 *
 * --- Why DTOs? ---
 * DTOs (Data Transfer Objects) describe the shape of data crossing the API
 * boundary. They give us a single place to document and later validate
 * request/response. We use a class (not an interface) so Nest can instantiate
 * it and so we can add class-validator decorators later. Optional fields (?)
 * here because v0.0.6 is contract-only; strict validation comes in later
 * versions.
 */
export class CreateAdminDto {
  label?: string;
  role?: string;
}
