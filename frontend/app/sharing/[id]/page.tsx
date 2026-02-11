'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  sharingGetById,
  sharingUpdate,
  sharingDelete,
} from '../../../lib/api';
import type { SharingResponse } from '../../../lib/types';

export default function SharingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<SharingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [isPublic, setIsPublic] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');

  useEffect(() => {
    setError(null);
    sharingGetById(id)
      .then((s) => {
        setItem(s);
        setIsPublic(s.public ?? false);
        setExpiresAt(s.expiresAt ?? '');
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    try {
      const res = await sharingUpdate(id, {
        public: isPublic,
        expiresAt: expiresAt || undefined,
      });
      setResult(JSON.stringify(res, null, 2));
      setItem(res);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await sharingDelete(id);
      setResult(JSON.stringify(res, null, 2));
      setTimeout(() => router.push('/sharing'), 600);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">
        Sharing {id}
      </h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {item && (
        <pre className="rounded border border-zinc-200 bg-zinc-50 p-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          {JSON.stringify(item, null, 2)}
        </pre>
      )}

      <form onSubmit={handleUpdate} className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          PUT /sharing/{id}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
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
            Update
          </button>
        </div>
      </form>

      <div className="space-y-2">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          DELETE /sharing/{id}
        </h2>
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
