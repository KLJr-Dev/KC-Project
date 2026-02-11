'use client';

import { useState } from 'react';
import { authRegister, authLogin } from '../../lib/api';

export default function AuthPage() {
  // register
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regResult, setRegResult] = useState<string | null>(null);
  const [regError, setRegError] = useState<string | null>(null);

  // login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginResult, setLoginResult] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegResult(null);
    setRegError(null);
    try {
      const res = await authRegister({
        email: regEmail,
        username: regUsername,
        password: regPassword,
      });
      setRegResult(JSON.stringify(res, null, 2));
    } catch (err) {
      setRegError(String(err));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginResult(null);
    setLoginError(null);
    try {
      const res = await authLogin({
        email: loginEmail,
        password: loginPassword,
      });
      setLoginResult(JSON.stringify(res, null, 2));
    } catch (err) {
      setLoginError(String(err));
    }
  };

  return (
    <div className="space-y-10">
      <h1 className="text-xl font-semibold text-black dark:text-zinc-100">
        Auth
      </h1>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Register */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            POST /auth/register
          </h2>

          {regError && (
            <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {regError}
            </pre>
          )}

          <form onSubmit={handleRegister} className="space-y-2">
            <input
              type="text"
              placeholder="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="username"
              value={regUsername}
              onChange={(e) => setRegUsername(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
            >
              Register
            </button>
          </form>

          {regResult && (
            <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              {regResult}
            </pre>
          )}
        </div>

        {/* Login */}
        <div className="space-y-4">
          <h2 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
            POST /auth/login
          </h2>

          {loginError && (
            <pre className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
              {loginError}
            </pre>
          )}

          <form onSubmit={handleLogin} className="space-y-2">
            <input
              type="text"
              placeholder="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <input
              type="text"
              placeholder="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              className="block w-full rounded border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded bg-black px-4 py-1.5 text-sm text-white dark:bg-zinc-100 dark:text-black"
            >
              Login
            </button>
          </form>

          {loginResult && (
            <pre className="rounded border border-green-300 bg-green-50 p-3 text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-300">
              {loginResult}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
