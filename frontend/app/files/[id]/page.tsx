'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { filesGetById, filesDelete, filesDownload } from '../../../lib/api';
import type { FileResponse } from '../../../lib/types';
import { formatUserError } from '../../../lib/errors';
import { formatBytes, formatDate, fileApprovalStatus } from '../../../lib/format';
import { isFileOwner } from '../../../lib/file-scope';
import { useAuth } from '../../../lib/auth-context';
import RequireAuth from '../../components/require-auth';
import ErrorBanner from '../../components/ui/error-banner';
import LoadingSpinner from '../../components/ui/loading-spinner';

export default function FileDetailPage() {
  return (
    <RequireAuth>
      <FileDetailContent />
    </RequireAuth>
  );
}

function FileDetailContent() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userId, isAdmin } = useAuth();
  const [file, setFile] = useState<FileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    filesGetById(id)
      .then(setFile)
      .catch((e) => setError(formatUserError(e)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    try {
      const blob = await filesDownload(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this file permanently?')) return;
    try {
      await filesDelete(id);
      router.push('/files');
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  if (loading) return <LoadingSpinner label="Loading file…" />;

  const accessDenied = file && !isAdmin && !isFileOwner(file, userId);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Link href="/files" className="text-sm text-muted underline hover:text-foreground">
        ← Back to My Files
      </Link>
      <ErrorBanner message={error} />
      {accessDenied && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
          You don&apos;t have access to this file. It may belong to another user.
        </div>
      )}
      {file && !accessDenied && (
        <div className="rounded-lg border border-border p-6 space-y-4">
          <h1 className="text-xl font-semibold text-foreground">{file.filename}</h1>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt className="text-muted">Size</dt>
            <dd>{formatBytes(file.size)}</dd>
            <dt className="text-muted">Type</dt>
            <dd>{file.mimetype}</dd>
            <dt className="text-muted">Status</dt>
            <dd className="capitalize">{fileApprovalStatus(file.approvalStatus)}</dd>
            <dt className="text-muted">Uploaded</dt>
            <dd>{formatDate(file.uploadedAt)}</dd>
            {file.description && (
              <>
                <dt className="text-muted">Description</dt>
                <dd>{file.description}</dd>
              </>
            )}
          </dl>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {downloading ? 'Downloading…' : 'Download'}
            </button>
            <Link
              href={`/sharing?fileId=${file.id}`}
              className="rounded-md border border-border px-4 py-2 text-sm"
            >
              Share
            </Link>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md border border-error/50 px-4 py-2 text-sm text-error"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
