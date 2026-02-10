/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request body for PUT /admin/update/:id. Partial shape; validation
 * minimal/absent. Fields define the contract, not behaviour.
 *
 * --- Why a separate Update DTO? ---
 * Update requests often allow partial payloads (only send what changed). We
 * use a dedicated DTO so the contract is explicit: clients know they can send
 * only label, only role, or both. Same shape as Create here for simplicity;
 * in real APIs update might have different rules (e.g. no id in body).
 */
export class UpdateAdminDto {
  label?: string;
  role?: string;
}
