/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for PUT /sharing/update/:id. Partial shape; validation
 * minimal/absent. Clients send only fields they want to change.
 *
 * --- Why separate from CreateSharingDto? ---
 * Update allows partial payloads; may have different rules (e.g. no fileId
 * change). Dedicated DTO keeps the contract clear.
 */
export class UpdateSharingDto {
  public?: boolean;
  expiresAt?: string;
}
