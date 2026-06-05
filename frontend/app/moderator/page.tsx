'use client';

import { useCallback, useEffect, useState } from 'react';
import { filesList, filesApprove } from '../../lib/api';
import type { FileResponse } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { fileApprovalStatus } from '../../lib/format';
import RequireRole from '../components/require-role';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';
import { filesDownload } from '../../lib/api';

export default function ModeratorPage() {
  return (
    <RequireRole roles={['moderator', 'admin']}>
      <ReviewQueue />
    </RequireRole>
  );
}

function ReviewQueue() {
  const [pending, setPending] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await filesList();
      setPending(all.filter((f) => fileApprovalStatus(f.approvalStatus) === 'pending'));
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    setActingId(id);
    setError(null);
    setSuccess(null);
    try {
      await filesApprove(id, status);
      setSuccess(`File ${status}`);
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setActingId(null);
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      const blob = await filesDownload(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Review Queue</h1>
        <p className="mt-1 text-sm text-muted">Approve or reject pending file uploads.</p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      {loading ? (
        <LoadingSpinner label="Loading pending files…" />
      ) : pending.length === 0 ? (
        <EmptyState title="No pending files" description="All uploads have been reviewed." />
      ) : (
        <div className="space-y-4">
          {pending.map((file) => (
            <div
              key={file.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-foreground">{file.filename}</p>
                <p className="text-sm text-muted">
                  Owner {file.ownerId} · {file.mimetype}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(file.id, file.filename)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Download
                </button>
                <button
                  type="button"
                  disabled={actingId === file.id}
                  onClick={() => handleApprove(file.id, 'approved')}
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={actingId === file.id}
                  onClick={() => handleApprove(file.id, 'rejected')}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
