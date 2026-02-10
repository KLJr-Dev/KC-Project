# Files DTOs — v0.0.6 Backend API Shape Definition

Request/response shapes for files routes. Stub only; no real file I/O or storage.
All files exist to freeze API contract for v0.0.6.

**NestJS convention:** Same as other modules: `dto/` for API-boundary types. Files have upload (request) and a single response DTO for upload + download metadata. No update route in v0.0.6.

- `upload-file.dto.ts` — POST /files/upload body (metadata stub)
- `file-response.dto.ts` — response for upload and for GET /files/download/:id (metadata only)
