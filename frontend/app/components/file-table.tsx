'use client';

import Link from 'next/link';
import type { FileResponse } from '../../lib/types';
import { formatBytes, formatDate, fileApprovalStatus } from '../../lib/format';

interface FileTableProps {
  files: FileResponse[];
  onDownload: (id: string, filename: string) => void;
  onDelete?: (id: string) => void;
  downloadingId?: string | null;
  showOwner?: boolean;
}

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === 'approved'
      ? 'bg-green-500/10 text-green-700 dark:text-green-400'
      : status === 'rejected'
        ? 'bg-red-500/10 text-red-700 dark:text-red-400'
        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles}`}>
      {status}
    </span>
  );
}

export default function FileTable({
  files,
  onDownload,
  onDelete,
  downloadingId,
  showOwner = false,
}: FileTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="px-4 py-3 font-medium text-muted">Filename</th>
            <th className="px-4 py-3 font-medium text-muted">Size</th>
            <th className="px-4 py-3 font-medium text-muted">Status</th>
            {showOwner && <th className="px-4 py-3 font-medium text-muted">Owner</th>}
            <th className="px-4 py-3 font-medium text-muted">Uploaded</th>
            <th className="px-4 py-3 font-medium text-muted">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const status = fileApprovalStatus(file.approvalStatus);
            return (
              <tr key={file.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    href={`/files/${file.id}`}
                    className="font-medium text-foreground hover:underline"
                  >
                    {file.filename}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted">{formatBytes(file.size)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={status} />
                </td>
                {showOwner && <td className="px-4 py-3 text-muted">{file.ownerId ?? '—'}</td>}
                <td className="px-4 py-3 text-muted">{formatDate(file.uploadedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onDownload(file.id, file.filename)}
                      disabled={downloadingId === file.id}
                      className="text-sm text-foreground underline disabled:opacity-50"
                    >
                      {downloadingId === file.id ? 'Downloading…' : 'Download'}
                    </button>
                    {status !== 'rejected' ? (
                      <Link
                        href={`/sharing?fileId=${file.id}`}
                        className="text-sm text-muted underline"
                      >
                        Share
                      </Link>
                    ) : (
                      <span className="text-sm text-muted" title="Rejected files cannot be shared">
                        Share
                      </span>
                    )}
                    {onDelete && (
                      <button
                        type="button"
                        onClick={() => onDelete(file.id)}
                        className="text-sm text-error underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
