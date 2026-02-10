/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for POST /sharing/create. Stub only; validation minimal/absent.
 * Defines the contract for creating a share (e.g. link to a file). Real
 * behaviour (public links, expiry) comes in v0.3.4.
 *
 * --- Why a dedicated Create DTO? ---
 * Same pattern as admin/users: request shape is explicit. Sharing typically
 * links a file to a share id or public link; we stub fileId and public flag
 * for the contract. Optional fields for v0.0.6.
 */
export class CreateSharingDto {
  fileId?: string;
  public?: boolean;
  expiresAt?: string;
}
