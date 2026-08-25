'use client';

/**
 * Notes list + create — Cycle-4 SoftDev (`v1.2.0`).
 *
 * Search uses parameterized `q` on the API. XSS is in detail-page render, not here.
 * Mod/admin see all notes (API scoped); users see own only.
 */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { notesCreateMultipart, notesDelete, notesFlag, notesList } from '../../lib/api';
import type { NoteResponse } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { formatDate } from '../../lib/format';
import { isNoteOwner } from '../../lib/note-scope';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function NotesPage() {
  return (
    <RequireAuth>
      <NotesContent />
    </RequireAuth>
  );
}

function NotesContent() {
  const { userId, isAdmin, isModerator } = useAuth();
  const privileged = isAdmin || isModerator;
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await notesList(q || undefined);
      setNotes(items);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required.');
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await notesCreateMultipart(title.trim(), body, attachment);
      setSuccess('Note created');
      setTitle('');
      setBody('');
      setAttachment(null);
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (note: NoteResponse) => {
    if (!confirm(`Delete note “${note.title}”?`)) return;
    setError(null);
    try {
      await notesDelete(note.id);
      setSuccess('Note deleted');
      await load();
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  const handleFlag = async (note: NoteResponse, flagged: boolean) => {
    setError(null);
    try {
      await notesFlag(note.id, flagged);
      setSuccess(flagged ? 'Note flagged' : 'Flag cleared');
      await load();
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  const visible = flaggedOnly ? notes.filter((n) => n.flagged) : notes;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
        <p className="mt-1 text-sm text-muted">
          {privileged
            ? 'Moderation view — all notes. Flag for review; admins can delete any.'
            : 'Create and search your notes. Attachments optional.'}
        </p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <form onSubmit={handleCreate} className="space-y-4 rounded-lg border border-border p-6">
        <h2 className="text-sm font-medium text-foreground">New note</h2>
        <div>
          <label className="text-xs text-muted">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Title"
          />
        </div>
        <div>
          <label className="text-xs text-muted">Body (HTML or markdown)</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
            placeholder={'Supports HTML and markdown — e.g. <b>hi</b> or **hi**'}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Attachment (optional)</label>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded file:border file:border-border file:bg-muted/30 file:px-3 file:py-1.5"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Create note'}
        </button>
      </form>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="text-xs text-muted">Search</label>
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by title or body"
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={load}
              className="rounded-md border border-border px-3 py-2 text-sm"
            >
              Search
            </button>
          </div>
          {privileged && (
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
              />
              Flagged only
            </label>
          )}
        </div>

        {loading ? (
          <LoadingSpinner label="Loading notes…" />
        ) : visible.length === 0 ? (
          <EmptyState title="No notes" description="Create a note or clear filters." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {visible.map((note) => (
              <li
                key={note.id}
                className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/notes/${note.id}`}
                      className="truncate font-medium text-foreground underline-offset-2 hover:underline"
                    >
                      {note.title}
                    </Link>
                    {note.flagged && (
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-800 dark:text-amber-200">
                        flagged
                      </span>
                    )}
                    {note.hasAttachment && (
                      <span className="rounded bg-muted/40 px-1.5 py-0.5 text-xs text-muted">
                        attachment
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted">
                    {privileged && !isNoteOwner(note, userId) ? `owner ${note.ownerId} · ` : ''}
                    updated {formatDate(note.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/notes/${note.id}`}
                    className="rounded-md border border-border px-2.5 py-1 text-xs"
                  >
                    Open
                  </Link>
                  {privileged && (
                    <button
                      type="button"
                      onClick={() => handleFlag(note, !note.flagged)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs"
                    >
                      {note.flagged ? 'Unflag' : 'Flag'}
                    </button>
                  )}
                  {(isNoteOwner(note, userId) || isAdmin) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(note)}
                      className="rounded-md border border-error/50 px-2.5 py-1 text-xs text-error"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
