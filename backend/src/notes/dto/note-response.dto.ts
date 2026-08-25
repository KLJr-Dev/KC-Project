/**
 * Note API response — omits attachmentStoragePath (CWE-200 / Files precedent).
 */
export class NoteResponseDto {
  id!: string;
  ownerId!: string;
  title!: string;
  body!: string;
  flagged!: boolean;
  attachmentFilename?: string;
  attachmentMimetype?: string;
  hasAttachment!: boolean;
  createdAt!: string;
  updatedAt!: string;
}
