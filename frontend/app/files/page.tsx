'use client';

import { useState } from 'react';
import Link from 'next/link';
import { filesUpload, filesGetById } from '../../lib/api';
import type { FileResponse } from '../../lib/types';

export default function FilesPage() {
  const [error, setError] = useState<string | null>(null);

  // upload
  const [filename, setFilename] = useState('');
  const [uploadResult, setUploadResult] = useState<string | null>(null);

  // lookup
  const [lookupId, setLookupId] = useState('');
  const [file, setFile] = useState<FileResponse | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadResult(null);
    setError(null);
    try {
      const res = await filesUpload({ filename });
      setUploadResult(JSON.stringify(res, null, 2));
      setFilename('');
    } catch (err) {
      setError(String(err));
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setFile(null);
    setError(null);
    try {
      const res = await filesGetById(lookupId);
      setFile(res);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">
        Files
      </h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {/* Upload */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          POST /files
        </h2>
        <form onSubmit={handleUpload} className="flex gap-2">
          <input
            type="text"
            placeholder="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
          >
            Upload
          </button>
        </form>
        {uploadResult && (
          <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {uploadResult}
          </pre>
        )}
      </div>

      {/* Lookup by ID */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          GET /files/:id
        </h2>
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            placeholder="file id"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
          >
            Fetch
          </button>
        </form>
        {file && (
          <div className="space-y-2">
            <pre className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              {JSON.stringify(file, null, 2)}
            </pre>
            <Link
              href={`/files/${file.id}`}
              className="text-sm text-blue-600 underline dark:text-blue-400"
            >
              Go to detail page →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
