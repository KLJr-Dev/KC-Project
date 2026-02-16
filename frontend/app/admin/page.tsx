'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminCreate, adminList } from '../../lib/api';
import type { AdminResponse } from '../../lib/types';

export default function AdminPage() {
  const [items, setItems] = useState<AdminResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [label, setLabel] = useState('');
  const [role, setRole] = useState('');
  const [createResult, setCreateResult] = useState<string | null>(null);

  const load = () => {
    setError(null);
    adminList()
      .then(setItems)
      .catch((e) => setError(String(e)));
  };

  useEffect(load, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateResult(null);
    setError(null);
    try {
      const res = await adminCreate({ label, role });
      setCreateResult(JSON.stringify(res, null, 2));
      setLabel('');
      setRole('');
      load();
    } catch (err) {
      setError(String(err));
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">Admin</h1>

      {error && (
        <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
          {error}
        </pre>
      )}

      {/* Create */}
      <form onSubmit={handleCreate} className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">POST /admin</h2>
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
        <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">GET /admin</h2>
        {items.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-400">No admin entries.</p>
        ) : (
          <table className="mt-2 w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="py-2 pr-4 font-medium text-zinc-500">ID</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Label</th>
                <th className="py-2 pr-4 font-medium text-zinc-500">Role</th>
                <th className="py-2 font-medium text-zinc-500">Created</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4">
                    <Link
                      href={`/admin/${a.id}`}
                      className="text-blue-600 underline dark:text-blue-400"
                    >
                      {a.id}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 font-mono">{a.label ?? '—'}</td>
                  <td className="py-2 pr-4 font-mono">{a.role ?? '—'}</td>
                  <td className="py-2 font-mono text-zinc-400">{a.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
