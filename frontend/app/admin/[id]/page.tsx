'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminGetById, adminUpdate, adminDelete } from '../../../lib/api';
import type { AdminResponse } from '../../../lib/types';

export default function AdminDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<AdminResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    setError(null);
    adminGetById(id)
      .then((a) => {
        setItem(a);
        setLabel(a.label ?? '');
        setRole(a.role ?? '');
      })
      .catch((e) => setError(String(e)));
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    try {
      const res = await adminUpdate(id, { label, role });
      setResult(JSON.stringify(res, null, 2));
      setItem(res);
    } catch (err) {
      setError(String(err));
    }
  };

  const handleDelete = async () => {
    setError(null);
    try {
      const res = await adminDelete(id);
      setResult(JSON.stringify(res, null, 2));
      setTimeout(() => router.push('/admin'), 600);
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">
        Admin {id}
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
          PUT /admin/{id}
        </h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
          <input
            type="text"
            placeholder="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
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
          DELETE /admin/{id}
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
