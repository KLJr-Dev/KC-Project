'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { filesGetById, filesDelete, filesDownload } from '../../../lib/api';
import type { FileResponse } from '../../../lib/types';

export default function FileDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [file, setFile] = useState<FileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setError(null);
    filesGetById(id)
      .then(setFile)
      .catch((e) => setError(String(e)));
  }, [id]);

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await filesDelete(id);
      setResult(JSON.stringify(res, null, 2));
      setTimeout(() => router.push('/files'), 600);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDownload = async () => {
    if (!file) return;
    setDownloading(true);
    setError(null);
    try {
      const blob = await filesDownload(id);
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
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">File {id}</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {file && (
        <pre className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {JSON.stringify(file, null, 2)}
        </pre>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /files/{id}/download</h2>
        <button
          onClick={handleDownload}
          disabled={downloading || !file}
          className="rounded bg-blue-600 px-4 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50 dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {downloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">DELETE /files/{id}</h2>
        <button
          onClick={handleDelete}
          className="rounded bg-red-600 px-4 py-1.5 text-sm text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>

      {result && (
        <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
          {result}
        </pre>
      )}
    </div>
  );
}
