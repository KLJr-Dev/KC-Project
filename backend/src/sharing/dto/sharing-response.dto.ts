/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Response shape for GET /sharing/read, GET /sharing/get/:id, and for
 * create/update responses. Stub only; data is mock. No persistence. Real
 * public links and expiry (v0.3.4) come later.
 *
 * --- Why one response DTO? ---
 * Same as admin/users: one consistent shape for the share resource (id,
 * fileId, public, createdAt, expiresAt). List and single-item use the same
 * type for v0.0.6.
 */
export class SharingResponseDto {
  id!: string;
  fileId?: string;
  public?: boolean;
  createdAt!: string;
  expiresAt?: string;
}
