'use client';

/**
 * Note detail — Cycle-4 SoftDev (`v1.2.0`).
 *
 * Dual XSS sinks (locked):
 * - HTML: body via dangerouslySetInnerHTML
 * - Markdown: unsafeMarkdownToHtml (raw HTML pass-through) then same sink
 *
 * Attachment: authenticated blob open (inline SVG/HTML on API).
 */
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  notesAttachmentBlob,
  notesDelete,
  notesFlag,
  notesGetById,
  notesUpdateMultipart,
} from '../../../lib/api';
import type { NoteResponse } from '../../../lib/types';
import { formatUserError } from '../../../lib/errors';
import { formatDate } from '../../../lib/format';
import { isNoteOwner } from '../../../lib/note-scope';
import { unsafeMarkdownToHtml } from '../../../lib/unsafe-markdown';
import { useAuth } from '../../../lib/auth-context';
import RequireAuth from '../../components/require-auth';
import ErrorBanner from '../../components/ui/error-banner';
import SuccessBanner from '../../components/ui/success-banner';
import LoadingSpinner from '../../components/ui/loading-spinner';

type RenderMode = 'html' | 'markdown';

export default function NoteDetailPage() {
  return (
    <RequireAuth>
      <NoteDetailContent />
    </RequireAuth>
  );
}

function NoteDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId, isAdmin, isModerator } = useAuth();
  const privileged = isAdmin || isModerator;

  const [note, setNote] = useState<NoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<RenderMode>('html');
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const n = await notesGetById(id);
      setNote(n);
      setTitle(n.title);
      setBody(n.body);
    } catch (err) {
      setNote(null);
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload when route id changes
  }, [id]);

  const renderedHtml = useMemo(() => {
    if (!note) return '';
    return mode === 'html' ? note.body : unsafeMarkdownToHtml(note.body);
  }, [note, mode]);

  const canEdit = note ? isNoteOwner(note, userId) : false;
  const canDelete = note ? isNoteOwner(note, userId) || isAdmin : false;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await notesUpdateMultipart(
        note.id,
        { title: title.trim(), body },
        attachment,
      );
      setNote(updated);
      setAttachment(null);
      setEditing(false);
      setSuccess('Note updated');
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !confirm('Delete this note permanently?')) return;
    try {
      await notesDelete(note.id);
      router.push('/notes');
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  const handleFlag = async () => {
    if (!note) return;
    try {
      const updated = await notesFlag(note.id, !note.flagged);
      setNote(updated);
      setSuccess(updated.flagged ? 'Flagged for review' : 'Flag cleared');
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  const handleOpenAttachment = async () => {
    if (!note?.hasAttachment) return;
    setError(null);
    try {
      const blob = await notesAttachmentBlob(note.id);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      // Revoke later so the new tab can still read the blob
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  if (loading) return <LoadingSpinner label="Loading note…" />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/notes" className="text-sm text-muted underline hover:text-foreground">
        ← Back to Notes
      </Link>
      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {note && (
        <div className="space-y-6 rounded-lg border border-border p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-foreground">{note.title}</h1>
              <p className="mt-1 text-xs text-muted">
                owner {note.ownerId} · updated {formatDate(note.updatedAt)}
                {note.flagged ? ' · flagged' : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setMode('html')}
                className={`rounded-md px-2.5 py-1 text-xs ${
                  mode === 'html' ? 'bg-primary text-primary-foreground' : 'border border-border'
                }`}
              >
                HTML
              </button>
              <button
                type="button"
                onClick={() => setMode('markdown')}
                className={`rounded-md px-2.5 py-1 text-xs ${
                  mode === 'markdown'
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border'
                }`}
              >
                Markdown
              </button>
            </div>
          </div>

          {/* Intentional XSS sinks — do not sanitize on v1.2.0 */}
          <div
            className="prose prose-sm max-w-none border-t border-border pt-4 text-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />

          {note.hasAttachment && (
            <div className="border-t border-border pt-4 text-sm">
              <p className="text-muted">
                Attachment:{' '}
                <span className="text-foreground">{note.attachmentFilename || 'file'}</span>
                {note.attachmentMimetype ? ` (${note.attachmentMimetype})` : ''}
              </p>
              <button
                type="button"
                onClick={handleOpenAttachment}
                className="mt-2 rounded-md border border-border px-3 py-1.5 text-sm"
              >
                Open attachment
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            {canEdit && (
              <button
                type="button"
                onClick={() => setEditing((v) => !v)}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                {editing ? 'Cancel edit' : 'Edit'}
              </button>
            )}
            {privileged && (
              <button
                type="button"
                onClick={handleFlag}
                className="rounded-md border border-border px-3 py-1.5 text-sm"
              >
                {note.flagged ? 'Unflag' : 'Flag'}
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-md border border-error/50 px-3 py-1.5 text-sm text-error"
              >
                Delete
              </button>
            )}
          </div>

          {editing && canEdit && (
            <form onSubmit={handleSave} className="space-y-3 border-t border-border pt-4">
              <div>
                <label className="text-xs text-muted">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Body</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted">Replace attachment</label>
                <input
                  type="file"
                  onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
                  className="mt-1 block w-full text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
