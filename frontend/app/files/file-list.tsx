'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { filesList, filesDownload } from '../../lib/api';
import type { FileResponse } from '../../lib/types';

/**
 * v0.5.1 - File List Component
 *
 * Displays all uploaded files with metadata and download/delete buttons.
 *
 * Features:
 * - Automatic fetch on mount (useEffect)
 * - Download button (triggers filesDownload blob + object URL)
 * - Link to detail page for metadata/deletion
 * - Error handling and loading states
 *
 * Security Notes (v0.5.1 Vulnerabilities):
 * - CWE-639 (IDOR): Lists all files, user can download ANY file (no ownership check)
 * - CWE-200 (Info Disclosure): storagePath exposed in metadata
 * - CWE-434 (MIME Confusion): Download returns client-supplied MIME type
 */
export function FileList() {
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setLoading(true);
    filesList()
      .then(setFiles)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, []);

  const handleDownload = async (file: FileResponse) => {
    setDownloading(file.id);
    try {
      const blob = await filesDownload(file.id);
      // Create object URL and trigger download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(`Download failed: ${String(err)}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        Loading files...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
        Error: {error}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
        No files uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        All Files ({files.length})
      </h2>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between gap-3 rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex-1 overflow-hidden">
              <p className="font-mono text-zinc-900 dark:text-zinc-100">
                {file.filename}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {file.mimetype} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'unknown size'} • {file.approvalStatus || 'pending'}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleDownload(file)}
                disabled={downloading === file.id}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                {downloading === file.id ? 'Downloading...' : 'Download'}
              </button>
              <Link
                href={`/files/${file.id}`}
                className="rounded bg-zinc-700 px-3 py-1 text-xs text-white hover:bg-zinc-800 dark:bg-zinc-600 dark:hover:bg-zinc-700"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
