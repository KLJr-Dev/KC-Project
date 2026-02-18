'use client';

import { useState } from 'react';
import Link from 'next/link';
import { filesUploadMultipart, filesGetById, filesList, filesDownload } from '../../lib/api';
import type { FileResponse } from '../../lib/types';

export default function FilesPage() {
  const [error, setError] = useState<string | null>(null);

  // upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [uploadedFile, setUploadedFile] = useState<FileResponse | null>(null);

  // lookup
  const [lookupId, setLookupId] = useState('');
  const [file, setFile] = useState<FileResponse | null>(null);

  // list
  const [files, setFiles] = useState<FileResponse[] | null>(null);

  const triggerDownload = async (id: string, filename: string) => {
    setError(null);
    try {
      const blob = await filesDownload(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploadedFile(null);
    if (!selectedFile) {
      setError('Please choose a file before uploading.');
      return;
    }
    try {
      const res = await filesUploadMultipart(selectedFile, description || undefined);
      setUploadedFile(res);
      setSelectedFile(null);
      setDescription('');
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
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">Files</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {/* Upload */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">POST /files</h2>
        <form onSubmit={handleUpload} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Choose file
            </span>
            <input
              id="file-input"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setSelectedFile(file);
              }}
              className="max-w-xs text-sm text-foreground file:mr-3 file:rounded file:border file:border-zinc-300 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium dark:text-zinc-100 dark:file:border-zinc-700 dark:file:bg-zinc-900"
            />
            {selectedFile && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Selected: {selectedFile.name}
              </span>
            )}
          </div>
          <input
            type="text"
            placeholder="description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
          >
            Upload
          </button>
        </form>
        {uploadedFile && (
          <div className="space-y-2">
            <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              {JSON.stringify(uploadedFile, null, 2)}
            </pre>
            <button
              type="button"
              onClick={() => triggerDownload(uploadedFile.id, uploadedFile.filename)}
              className="text-sm text-blue-600 underline dark:text-blue-400"
            >
              Download uploaded file →
            </button>
          </div>
        )}
      </div>

      {/* Lookup by ID */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /files/:id</h2>
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
            <button
              type="button"
              onClick={() => triggerDownload(file.id, file.filename)}
              className="text-sm text-blue-600 underline dark:text-blue-400"
            >
              Download this file →
            </button>
            <Link
              href={`/files/${file.id}`}
              className="text-sm text-blue-600 underline dark:text-blue-400"
            >
              Go to detail page →
            </Link>
          </div>
        )}
      </div>

      {/* List all files */}
      <div className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /files</h2>
        <button
          type="button"
          onClick={async () => {
            setError(null);
            try {
              const result = await filesList();
              if (!Array.isArray(result)) {
                throw new Error('Unexpected /files response shape (expected array).');
              }
              setFiles(result);
            } catch (err) {
              setError(String(err));
            }
          }}
          className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
        >
          Load all files
        </button>
        {files && (
          <div className="mt-2 space-y-2">
            {files.length === 0 && (
              <p className="text-sm text-muted">No files found.</p>
            )}
            {files.length > 0 && (
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-2 py-1 text-left">ID</th>
                    <th className="px-2 py-1 text-left">Filename</th>
                    <th className="px-2 py-1 text-left">Owner</th>
                    <th className="px-2 py-1 text-left">MIME</th>
                    <th className="px-2 py-1 text-left">Size</th>
                    <th className="px-2 py-1 text-left">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((f) => (
                    <tr
                      key={f.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800"
                    >
                      <td className="px-2 py-1 align-top">{f.id}</td>
                      <td className="px-2 py-1 align-top">{f.filename}</td>
                      <td className="px-2 py-1 align-top text-xs text-muted">{f.ownerId}</td>
                      <td className="px-2 py-1 align-top text-xs text-muted">{f.mimetype}</td>
                      <td className="px-2 py-1 align-top">{f.size}</td>
                      <td className="px-2 py-1 align-top">
                        <button
                          type="button"
                          onClick={() => triggerDownload(f.id, f.filename)}
                          className="text-blue-600 underline dark:text-blue-400"
                        >
                          download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
