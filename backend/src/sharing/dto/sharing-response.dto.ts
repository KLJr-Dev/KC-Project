/**
 * Sharing record API response (v2.1.0).
 * Historical (v1.0.0): predictable publicToken / weak ownership — see Cycle-1 writeup.
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
