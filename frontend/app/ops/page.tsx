'use client';

/**
 * Ops Documents — Cycle-7 Blue (`v2.4.0`).
 * Authenticated handbook viewer; backend confines paths under the library root.
 */
import { useState } from 'react';
import { opsDocumentsGet, type OpsDocumentResult } from '../../lib/api';
import { formatUserError } from '../../lib/errors';
import RequireAuth from '../components/require-auth';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function OpsPage() {
  return (
    <RequireAuth>
      <OpsContent />
    </RequireAuth>
  );
}

function OpsContent() {
  const [path, setPath] = useState('handbook.txt');
  const [doc, setDoc] = useState<OpsDocumentResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setDoc(null);
    try {
      const result = await opsDocumentsGet(path.trim());
      setDoc(result);
      setSuccess('Document loaded');
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Ops Documents</h1>
        <p className="text-sm text-muted">
          Browse Northwind Ops handbook files by relative path under the document library.
        </p>
      </div>

      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <form onSubmit={handleOpen} className="space-y-4 rounded-md border border-border p-6">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground">Path</span>
          <input
            type="text"
            required
            value={path}
            onChange={(e) => setPath(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm text-foreground"
            placeholder="handbook.txt"
            autoComplete="off"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {loading ? 'Opening…' : 'Open'}
        </button>
      </form>

      {loading && <LoadingSpinner />}

      {doc && (
        <div className="space-y-2 rounded-md border border-border p-6">
          <p className="text-xs font-mono text-muted">{doc.path}</p>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words text-sm text-foreground">
            {doc.content}
          </pre>
        </div>
      )}
    </div>
  );
}
