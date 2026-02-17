/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Response shape for file metadata. Includes ownerId (who uploaded it),
 * but no endpoint checks that the requesting user matches ownerId.
 *
 * VULN (v0.2.2): ownerId is exposed in the response but never enforced.
 *       Any authenticated user can see who owns a file, and still
 *       access or delete it regardless.
 *       CWE-639 | A01:2021
 */
export class FileResponseDto {
  id!: string;
  ownerId?: string;
  filename!: string;
  size?: number;
  uploadedAt!: string;
}
