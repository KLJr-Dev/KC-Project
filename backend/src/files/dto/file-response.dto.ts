/**
 * v0.3.0 -- File Upload
 *
 * Response shape for file metadata. Now includes mimetype and storagePath
 * from real Multer uploads.
 *
 * VULN (v0.2.2): ownerId exposed but never enforced. CWE-639 | A01:2025
 *
 * VULN (v0.3.0): storagePath exposes the server filesystem path to any
 *       authenticated user. CWE-200 | A01:2025
 */
export class FileResponseDto {
  id!: string;
  ownerId?: string;
  filename!: string;
  mimetype?: string;
  storagePath?: string;
  description?: string;
  size?: number;
  uploadedAt!: string;
}
