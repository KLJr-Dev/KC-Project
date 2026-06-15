import type { FileResponse, SharingResponse } from './types';
import { fileApprovalStatus } from './format';

/** Product UI: show only files owned by the current user. API still returns all (IDOR). */
export function filesForUser(files: FileResponse[], userId: string | null): FileResponse[] {
  if (!userId) return [];
  return files.filter((f) => f.ownerId === userId);
}

/** Product UI: show only shares created by the current user. */
export function sharesForUser(shares: SharingResponse[], userId: string | null): SharingResponse[] {
  if (!userId) return [];
  return shares.filter((s) => s.ownerId === userId);
}

/** Share picker: exclude rejected files; pending still selectable with warning. */
export function filesShareable(files: FileResponse[]): FileResponse[] {
  return files.filter((f) => fileApprovalStatus(f.approvalStatus) !== 'rejected');
}

export function isFileOwner(file: FileResponse, userId: string | null): boolean {
  return !!userId && file.ownerId === userId;
}
