/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Request shape for POST /files/upload. Stub only; no actual file handling.
 * In v0.3.x we'll have multipart/form-data and real storage; here we only
 * define the contract (e.g. client may send filename or the backend will
 * derive it). Validation minimal/absent.
 *
 * --- Why a DTO for upload? ---
 * Upload can be multipart (file + metadata) or JSON (e.g. base64 + filename).
 * Defining a stub DTO locks the intended request shape. For v0.0.6 we accept
 * optional metadata only; "file" content is not processed.
 */
export class UploadFileDto {
  filename?: string;
}
