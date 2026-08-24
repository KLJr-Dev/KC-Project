/**
 * Auth register/login page (v2.1.0).
 *
 * On success, AuthContext stores the access JWT in memory and relies on the
 * httpOnly refresh cookie (not localStorage). Password still travels in the
 * JSON body — use TLS lab profile off loopback.
 *
 * Client-side validation is UX only; backend ValidationPipe is authoritative.
 */
'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authRegister, authLogin } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import { ValidationError } from '../../lib/api';
import { DEMO_USERS } from '../../lib/demo-users';
import { isLabUiEnabled } from '../../lib/lab-flags';
import FormInput from '../components/ui/form-input';
import SubmitButton from '../components/ui/submit-button';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';

type AuthMode = 'register' | 'login';

/**
 * Client-side email format validation. UX convenience only — not a
 * security control. The backend must independently validate all input.
 * An attacker can bypass this trivially via DevTools or direct API calls.
 *
 * Backend constraint: @IsEmail (standard email format validation)
 */
function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}

/**
 * Client-side username validation matching backend constraints.
 * Backend: @MinLength(3), @MaxLength(50)
 */
function validateUsername(username: string): string | null {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 50) return 'Username must be at most 50 characters';
  return null;
}

/**
 * Client-side password validation matching backend weak pattern.
 * Backend: @MinLength(1) only — intentionally weak (CWE-521)
 * In v1.0.0+, server-side validation would enforce strength.
 */
function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 1) return 'Password must be at least 1 character';
  return null;
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const nextPath = searchParams.get('next') ?? '/files';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showDemo, setShowDemo] = useState(false);
  const { login } = useAuth();

  // ── Register state ──────────────────────────────────────────────────
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState<string | null>(null);
  const [regFieldErrors, setRegFieldErrors] = useState<Record<string, string | null>>({});

  // ── Login state ─────────────────────────────────────────────────────
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [loginFieldErrors, setLoginFieldErrors] = useState<Record<string, string | null>>({});

  // ── Register handler ────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string | null> = {
      email: validateEmail(regEmail),
      username: validateUsername(regUsername),
      password: validatePassword(regPassword),
    };
    setRegFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setRegLoading(true);
    setRegError(null);
    setRegSuccess(null);

    try {
      const res = await authRegister({
        email: regEmail,
        username: regUsername,
        password: regPassword,
      });
      login(res);
      router.push(nextPath);
    } catch (err) {
      // Handle structured validation errors from backend
      if (err instanceof ValidationError) {
        const fieldErrors: Record<string, string | null> = {};
        // Extract first constraint message for each field
        for (const [field, messages] of Object.entries(err.errors)) {
          fieldErrors[field] = messages && messages.length > 0 ? messages[0] : null;
        }
        setRegFieldErrors(fieldErrors);
        setRegError('Please check the highlighted fields');
      } else {
        setRegError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setRegLoading(false);
    }
  };

  // ── Login handler ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string | null> = {
      email: validateEmail(loginEmail),
      password: validatePassword(loginPassword),
    };
    setLoginFieldErrors(errors);

    if (Object.values(errors).some(Boolean)) return;

    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      const res = await authLogin({
        email: loginEmail,
        password: loginPassword,
      });
      login(res);
      router.push(nextPath);
    } catch (err) {
      // Handle structured validation errors from backend
      if (err instanceof ValidationError) {
        const fieldErrors: Record<string, string | null> = {};
        // Extract first constraint message for each field
        for (const [field, messages] of Object.entries(err.errors)) {
          fieldErrors[field] = messages && messages.length > 0 ? messages[0] : null;
        }
        setLoginFieldErrors(fieldErrors);
        setLoginError('Please check the highlighted fields');
      } else {
        setLoginError(err instanceof Error ? err.message : String(err));
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Tab bar ─────────────────────────────────────────────────────────
  const tabs: { key: AuthMode; label: string }[] = [
    { key: 'register', label: 'Register' },
    { key: 'login', label: 'Sign In' },
  ];

  return (
    <div className="flex justify-center pt-8">
      <div className="w-full max-w-md space-y-6">
        {/* Tabs */}
        <div className="flex rounded-md border border-border">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setMode(tab.key)}
              className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
                mode === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted hover:text-foreground'
              } ${tab.key === 'register' ? 'rounded-l-md' : 'rounded-r-md'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Register form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <ErrorBanner message={regError} />
            <SuccessBanner message={regSuccess} />

            <FormInput
              id="reg-email"
              label="Email"
              type="email"
              value={regEmail}
              onChange={setRegEmail}
              required
              placeholder="you@example.com"
              error={regFieldErrors.email}
              disabled={regLoading}
              autoComplete="email"
            />

            <FormInput
              id="reg-username"
              label="Username"
              value={regUsername}
              onChange={setRegUsername}
              required
              placeholder="Choose a username"
              error={regFieldErrors.username}
              disabled={regLoading}
              autoComplete="username"
            />

            <FormInput
              id="reg-password"
              label="Password"
              type="password"
              value={regPassword}
              onChange={setRegPassword}
              required
              placeholder="Create a password"
              error={regFieldErrors.password}
              disabled={regLoading}
              autoComplete="new-password"
            />

            <SubmitButton loading={regLoading} loadingText="Creating account…">
              Create Account
            </SubmitButton>

            <p className="text-center text-sm text-muted">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Sign in
              </button>
            </p>
          </form>
        )}

        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <ErrorBanner message={loginError} />
            <SuccessBanner message={loginSuccess} />

            <FormInput
              id="login-email"
              label="Email"
              type="email"
              value={loginEmail}
              onChange={setLoginEmail}
              required
              placeholder="you@example.com"
              error={loginFieldErrors.email}
              disabled={loginLoading}
              autoComplete="email"
            />

            <FormInput
              id="login-password"
              label="Password"
              type="password"
              value={loginPassword}
              onChange={setLoginPassword}
              required
              placeholder="Enter your password"
              error={loginFieldErrors.password}
              disabled={loginLoading}
              autoComplete="current-password"
            />

            <SubmitButton loading={loginLoading} loadingText="Signing in…">
              Sign In
            </SubmitButton>

            <p className="text-center text-sm text-muted">
              Need an account?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-foreground underline underline-offset-2 hover:opacity-80"
              >
                Register
              </button>
            </p>
          </form>
        )}

        {isLabUiEnabled() && DEMO_USERS.length > 0 && (
          <div className="rounded-lg border border-border p-4">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="text-sm font-medium text-foreground"
            >
              {showDemo ? 'Hide' : 'Show'} demo accounts
            </button>
            {showDemo && (
              <div className="mt-3 space-y-2">
                {DEMO_USERS.map((d) => (
                  <button
                    key={d.email}
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setLoginEmail(d.email);
                      setLoginPassword(d.password);
                      setLoginError(null);
                    }}
                    className="block w-full rounded-md border border-border px-3 py-2 text-left text-sm hover:bg-muted/30"
                  >
                    <span className="font-medium">{d.label}</span>
                    <span className="ml-2 text-muted">{d.email}</span>
                  </button>
                ))}
                <p className="text-xs text-muted">
                  Seeded on Docker startup. See docs/deploy/demo-users.md
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={<div className="flex justify-center pt-8 text-sm text-muted">Loading…</div>}
    >
      <AuthPageContent />
    </Suspense>
  );
}
