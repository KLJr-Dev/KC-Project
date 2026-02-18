/**
 * v0.3.4 -- Public File Sharing
 *
 * Response shape for sharing records. Now includes publicToken for
 * unauthenticated public access.
 *
 * VULN (v0.2.2): ownerId exposed but never enforced (CWE-639).
 * VULN (v0.3.4): publicToken is sequential and predictable (CWE-330).
 */
export class SharingResponseDto {
  id!: string;
  ownerId?: string;
  fileId?: string;
  publicToken?: string;
  public?: boolean;
  createdAt!: string;
  expiresAt?: string;
}
