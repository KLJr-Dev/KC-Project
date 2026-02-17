/**
 * v0.2.2 — Identifier Trust Failures
 *
 * Response shape for sharing records. Includes ownerId (who created it),
 * but no endpoint checks that the requesting user matches ownerId.
 *
 * VULN (v0.2.2): ownerId exposed but never enforced (CWE-639).
 */
export class SharingResponseDto {
  id!: string;
  ownerId?: string;
  fileId?: string;
  public?: boolean;
  createdAt!: string;
  expiresAt?: string;
}
