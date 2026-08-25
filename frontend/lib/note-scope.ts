import type { NoteResponse } from './types';

export function isNoteOwner(note: NoteResponse, userId: string | null): boolean {
  if (!userId) return false;
  return note.ownerId === userId;
}
