/**
 * File metadata API response (v2.1.0).
 *
 * Historical (v1.0.0): storagePath exposed; ownerId unused for authz.
 * Current: services omit storagePath from responses; ownership enforced in service layer.
 */
export class FileResponseDto {
  id!: string;
  ownerId?: string;
  filename!: string;
  mimetype?: string;
  storagePath?: string;
  description?: string;
  size?: number;
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  uploadedAt!: string;
}
