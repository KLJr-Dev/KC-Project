'use client';

import { useCallback, useEffect, useState } from 'react';
import { filesUploadMultipart, filesList, filesDownload, filesDelete } from '../../lib/api';
import type { FileResponse } from '../../lib/types';
import { formatUserError } from '../../lib/errors';
import { filesForUser } from '../../lib/file-scope';
import { useAuth } from '../../lib/auth-context';
import RequireAuth from '../components/require-auth';
import FileTable from '../components/file-table';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';
import EmptyState from '../components/ui/empty-state';
import LoadingSpinner from '../components/ui/loading-spinner';

export default function FilesPage() {
  return (
    <RequireAuth>
      <MyFilesContent />
    </RequireAuth>
  );
}

function MyFilesContent() {
  const { userId } = useAuth();
  const [files, setFiles] = useState<FileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await filesList();
      setFiles(filesForUser(all, userId));
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Choose a file to upload.');
      return;
    }
    setUploading(true);
    setError(null);
    setSuccess(null);
    try {
      await filesUploadMultipart(selectedFile, description || undefined);
      setSuccess(`Uploaded ${selectedFile.name}`);
      setSelectedFile(null);
      setDescription('');
      await load();
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    setDownloadingId(id);
    setError(null);
    try {
      const blob = await filesDownload(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(formatUserError(err));
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this file?')) return;
    setError(null);
    try {
      await filesDelete(id);
      setSuccess('File deleted');
      await load();
    } catch (err) {
      setError(formatUserError(err));
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">My Files</h1>
        <p className="mt-1 text-sm text-muted">Upload, download, and manage your files.</p>
      </div>

      <ErrorBanner message={error} />
      <SuccessBanner message={success} />

      <form onSubmit={handleUpload} className="rounded-lg border border-border p-6 space-y-4">
        <h2 className="text-sm font-medium text-foreground">Upload a file</h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs text-muted">File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-sm file:mr-3 file:rounded file:border file:border-border file:bg-muted/30 file:px-3 file:py-1.5"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Notes about this file"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-foreground">Your files</h2>
          <button
            type="button"
            onClick={load}
            className="text-sm text-muted underline hover:text-foreground"
          >
            Refresh
          </button>
        </div>
        {loading ? (
          <LoadingSpinner label="Loading files…" />
        ) : files.length === 0 ? (
          <EmptyState
            title="No files yet"
            description="Upload your first file using the form above."
          />
        ) : (
          <FileTable
            files={files}
            onDownload={handleDownload}
            onDelete={handleDelete}
            downloadingId={downloadingId}
          />
        )}
      </div>
    </div>
  );
}
