/**
 * Cycle-10 — Document Ops packet inbox (moderator graded path).
 *
 * List + multipart upload → Nest `/packets` only (never docproc from browser).
 */
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { packetsList, packetsUpload } from '../../lib/api';
import type { DocumentPacket } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';
import SubmitButton from '../components/ui/submit-button';

export default function PacketsPage() {
  return (
    <RequireAuth>
      <PacketsBody />
    </RequireAuth>
  );
}

function PacketsBody() {
  const { isModerator, isAdmin, role } = useAuth();
  const canUse = isModerator || isAdmin;

  if (!canUse) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <span className="nw-stamp">Document Ops</span>
        <h1 className="text-2xl font-semibold text-foreground">Packets restricted</h1>
        <p className="text-sm text-muted">
          The packet inbox is limited to Document Operations staff
          {role ? ` (signed in as ${role})` : ''}. Open registration does not
          grant intake — use a Document Ops staff account if your desk was provisioned.
        </p>
        <Link href="/files" className="text-sm text-foreground underline">
          Back to My Files
        </Link>
      </div>
    );
  }

  return <PacketsWorkspace />;
}

function PacketsWorkspace() {
  const [items, setItems] = useState<DocumentPacket[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await packetsList());
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Choose a packet file to upload');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const row = await packetsUpload(file);
      setSuccess(`Queued ${row.originalName} — status ${row.status}`);
      setFile(null);
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <span className="nw-stamp">Document Ops</span>
          <h1 className="text-2xl font-semibold text-foreground">Packet inbox</h1>
          <p className="max-w-xl text-sm text-muted">
            Drop vendor and partner packets for classification. Files are handed to the
            Document Ops helper on the processing host — keep original filenames for the
            cutover audit trail.
          </p>
        </div>
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs text-muted">
          <p className="font-medium text-foreground">Desk queue</p>
          <p>{loading ? '…' : `${items.length} packet${items.length === 1 ? '' : 's'}`}</p>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <form
        onSubmit={handleUpload}
        className="max-w-md space-y-3 rounded-md border border-border bg-surface p-5"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          New inbound packet
        </p>
        <label className="block text-sm font-medium text-foreground" htmlFor="packet-file">
          Packet file
        </label>
        <input
          id="packet-file"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:text-primary-foreground"
        />
        <SubmitButton loading={uploading} disabled={!file}>
          Submit to Document Ops
        </SubmitButton>
      </form>

      <div>
        <h2 className="text-sm font-medium text-muted">Processed / queued</h2>
        {loading ? (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            title="Inbox empty"
            description="No partner packets on this desk yet. Upload a vendor packet to start the Document Ops helper."
          />
        ) : (
          <ul className="mt-3 divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
            {items.map((p) => (
              <li key={p.id} className="px-4 py-3 text-sm">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground font-mono text-[13px]">
                    {p.originalName}
                  </span>
                  <span className="rounded bg-accent-soft px-2 py-0.5 text-xs text-foreground">
                    {p.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{p.createdAt}</p>
                {p.helperOutput ? (
                  <pre className="mt-2 max-h-32 overflow-auto rounded border border-border bg-background p-2 font-mono text-xs text-muted">
                    {p.helperOutput}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
