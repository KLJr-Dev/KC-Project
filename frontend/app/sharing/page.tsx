'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { sharingCreate, sharingList } from '../../lib/api';
import type { SharingResponse } from '../../lib/types';

export default function SharingPage() {
  const [items, setItems] = useState<SharingResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [fileId, setFileId] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [createResult, setCreateResult] = useState<string | null>(null);

  const load = () => {
    setError(null);
    sharingList()
      .then(setItems)
      .catch((e) => setError(String(e)));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateResult(null);
    setError(null);
    try {
      const res = await sharingCreate({
        fileId: fileId || undefined,
        public: isPublic,
        expiresAt: expiresAt || undefined,
      });
      setCreateResult(JSON.stringify(res, null, 2));
      setFileId('');
      setIsPublic(false);
      setExpiresAt('');
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">Sharing</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {/* Create */}
      <form onSubmit={handleCreate} className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">POST /sharing</h2>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="fileId"
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="expiresAt (ISO)"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <label className="flex items-center gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            public
          </label>
          <button
            type="submit"
            className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
          >
            Create
          </button>
        </div>
        {createResult && (
          <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {createResult}
          </pre>
        )}
      </form>

      {/* List */}
      <div>
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /sharing</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No sharing entries.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium text-zinc-500">ID</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">File ID</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Public</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Expires</th>
                <th className="py-2 font-medium text-zinc-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/sharing/${s.id}`}
                      className="text-blue-600 underline dark:text-blue-400"
                    >
                      {s.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-mono">{s.fileId ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono">{s.public ? 'yes' : 'no'}</td>
                  <td className="py-2 pr-4 font-mono text-zinc-400">{s.expiresAt ?? '—'}</td>
                  <td className="py-2 font-mono text-zinc-400">{s.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
