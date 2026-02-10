/**
 * v0.0.6 — Backend API Shape Definition
 *
 * Response shape for upload (POST /files/upload) and download metadata
 * (GET /files/download/:id). Stub only; no real storage. Used so clients
 * know what to expect: id, filename, size, uploadedAt. Actual file bytes
 * come in v0.3.x; here we return metadata only.
 *
 * --- Why metadata-only response for download in v0.0.6? ---
 * Real download would stream file content. For API shape we only define
 * the response type. We use the same DTO for "upload success" and "download
 * info" so the file resource has one consistent shape.
 */
export class FileResponseDto {
  id: string;
  filename: string;
  size?: number;
  uploadedAt: string;
}
