/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Response shape for GET /admin/read, GET /admin/get/:id, and for create/update
 * responses. Stub only; data is mock. No persistence.
 *
 * --- Why a response DTO? ---
 * Defining the response shape locks what the frontend (or API consumers) can
 * rely on. We use one response DTO for read, get, create, and update so the
 * contract is consistent. id and createdAt are server-set; label and role can
 * come from request. Later we might split (e.g. ListResponse vs ItemResponse)
 * if we need different shapes for list vs single item.
 */
export class AdminResponseDto {
  id: string;
  label?: string;
  role?: string;
  createdAt: string;
}
