'use client';

/**
 * Link Preview + bookmarks — Cycle-6 Blue (`v2.3.0`).
 * Preview uses Bearer JWT + destination policy. Bookmark save uses refresh cookie + CSRF header.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  bookmarksList,
  bookmarksSave,
  previewFetch,
  type BookmarkListResult,
  type PreviewResult,
} from '../../lib/api';
import { formatUserError } from '../../lib/errors';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function PreviewPage() {
  return (
    <RequireAuth>
      <PreviewContent />
    </RequireAuth>
  );
}

function PreviewContent() {
  const [url, setUrl] = useState('https://example.com');
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkListResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadBookmarks = useCallback(async () => {
    try {
      setBookmarks(await bookmarksList());
    } catch {
      setBookmarks(null);
    }
  }, []);

  useEffect(() => {
    void loadBookmarks();
  }, [loadBookmarks]);

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setPreview(null);
    try {
      const result = await previewFetch(url.trim());
      setPreview(result);
      setSuccess('Preview fetched');
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);
    try {
      const saved = await bookmarksSave(url.trim());
      setSuccess(saved.message);
      await loadBookmarks();
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Link Preview</h1>
        <p className="text-sm text-muted">
          Fetch a URL on the server to show a title and snippet. Save bookmarks to your account.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <form onSubmit={handlePreview} className="space-y-4 rounded-md border border-border p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">URL</span>
          <input
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="https://…"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {loading ? 'Fetching…' : 'Preview'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground"
          >
            Save bookmark
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner />}

      {preview && (
        <div className="space-y-2 rounded-md border border-border p-6">
          <h2 className="text-sm font-medium text-muted">Preview result</h2>
          <p className="text-sm text-foreground">
            <span className="font-medium">Status:</span> {preview.status}
          </p>
          {preview.title && (
            <p className="text-sm text-foreground">
              <span className="font-medium">Title:</span> {preview.title}
            </p>
          )}
          {preview.contentType && (
            <p className="text-sm text-muted">Content-Type: {preview.contentType}</p>
          )}
          <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-muted/20 p-3 text-xs text-foreground">
            {preview.snippet}
          </pre>
        </div>
      )}

      <div className="space-y-3 rounded-md border border-border p-6">
        <h2 className="text-sm font-medium text-muted">Saved bookmarks</h2>
        {!bookmarks?.items?.length ? (
          <p className="text-sm text-muted">No bookmarks yet.</p>
        ) : (
          <ul className="space-y-2 text-sm text-foreground">
            {bookmarks.items.map((b) => (
              <li key={b.id} className="break-all">
                {b.url}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
