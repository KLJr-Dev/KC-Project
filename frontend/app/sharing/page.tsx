'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  sharingCreate,
  sharingList,
  sharingFriendlyUrl,
  sharingPublicUrl,
  filesList,
} from '../../lib/api';
import type { SharingResponse, FileResponse } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { formatDate, fileApprovalStatus } from '../../lib/format';
import { filesForUser, sharesForUser, filesShareable } from '../../lib/file-scope';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function SharingPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<LoadingSpinner />}>
        <SharingContent />
      </Suspense>
    </RequireAuth>
  );
}

function SharingContent() {
  const { userId } = useAuth();
  const searchParams = useSearchParams();
  const prefillFileId = searchParams.get('fileId') ?? '';

  const [items, setItems] = useState<SharingResponse[]>([]);
  const [myFiles, setMyFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileId, setFileId] = useState(prefillFileId);
  const [isPublic, setIsPublic] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [shares, files] = await Promise.all([sharingList(), filesList()]);
      setItems(sharesForUser(shares, userId));
      setMyFiles(filesShareable(filesForUser(files, userId)));
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (prefillFileId) setFileId(prefillFileId);
  }, [prefillFileId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileId) {
      setError('Select a file to share.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const created = await sharingCreate({
        fileId,
        public: isPublic,
        expiresAt: expiresAt || undefined,
      });
      const friendlyUrl =
        created.public && created.publicToken ? sharingFriendlyUrl(created.publicToken) : null;
      setSuccess(friendlyUrl ? `Share link created: ${friendlyUrl}` : 'Share link created');
      setFileId('');
      setExpiresAt('');
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess('Copied to clipboard');
    } catch {
      setError('Could not copy to clipboard');
    }
  };

  const fileName = (fid: string) => myFiles.find((f) => f.id === fid)?.filename ?? `File #${fid}`;

  const selectedFile = myFiles.find((f) => f.id === fileId);
  const selectedPending =
    selectedFile && fileApprovalStatus(selectedFile.approvalStatus) === 'pending';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Shares</h1>
        <p className="mt-1 text-sm text-muted">Create and manage sharing links for your files.</p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <form onSubmit={handleCreate} className="rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-sm font-medium text-foreground">Create a share</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs text-muted">File</label>
            <select
              value={fileId}
              onChange={(e) => setFileId(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            >
              <option value="">Select a file…</option>
              {myFiles.map((f) => {
                const status = fileApprovalStatus(f.approvalStatus);
                const suffix = status === 'pending' ? ' (awaiting review)' : '';
                return (
                  <option key={f.id} value={f.id}>
                    {f.filename}
                    {suffix}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">Expires (optional)</label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>
        {selectedPending && (
          <p className="text-sm text-amber-700 dark:text-amber-300">
            This file is awaiting moderator review. You can still create a share link.
          </p>
        )}
        <label className="flex items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          Public link (no login required)
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {submitting ? 'Creating…' : 'Create share'}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-foreground">Active shares</h2>
        {loading ? (
          <LoadingSpinner />
        ) : items.length === 0 ? (
          <EmptyState
            title="No shares yet"
            description="Create a share link for one of your files."
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 font-medium text-muted">File</th>
                  <th className="px-4 py-3 font-medium text-muted">Public</th>
                  <th className="px-4 py-3 font-medium text-muted">Link</th>
                  <th className="px-4 py-3 font-medium text-muted">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((s) => {
                  const friendlyUrl =
                    s.public && s.publicToken ? sharingFriendlyUrl(s.publicToken) : null;
                  const apiUrl = s.public && s.publicToken ? sharingPublicUrl(s.publicToken) : null;
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3">{fileName(s.fileId ?? '')}</td>
                      <td className="px-4 py-3">{s.public ? 'Yes' : 'No'}</td>
                      <td className="px-4 py-3">
                        {friendlyUrl ? (
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={friendlyUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="underline text-foreground"
                            >
                              Open
                            </a>
                            <button
                              type="button"
                              onClick={() => copyText(friendlyUrl)}
                              className="text-muted underline"
                            >
                              Copy
                            </button>
                            {apiUrl && (
                              <button
                                type="button"
                                onClick={() => copyText(apiUrl)}
                                className="text-xs text-muted underline"
                                title="Direct API download URL"
                              >
                                Copy API
                              </button>
                            )}
                          </div>
                        ) : s.public ? (
                          <span className="text-amber-700 dark:text-amber-300">
                            Public flag set but no link — recreate share
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{formatDate(s.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
