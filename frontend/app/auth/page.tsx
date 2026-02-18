/**
 * v0.1.5 — Authentication Edge Cases
 *
 * CWE-615 WARNING: This page is client-side rendered ('use client'). All
 * comments, form handling logic, API endpoint names, validation patterns,
 * and auth flow details are shipped to the browser and visible in DevTools.
 * CWE-615 (Inclusion of Sensitive Information in Source Code Comments) | A02:2025
 *
 * --- Purpose ---
 * Combined register/login page with tab switching. Renders two forms that
 * call authRegister() and authLogin() from lib/api.ts. On success, stores
 * the JWT via AuthContext.login() which writes to localStorage.
 *
 * --- Security notes for this page ---
 *
 * Password in React state: The password field value is held in React state
 * (regPassword / loginPassword). This means it's visible in:
 *   - React DevTools component inspector (state tab)
 *   - Browser memory (until garbage collected after unmount)
 *   - Network tab (sent as JSON in the POST body over plain HTTP)
 * There is no way to avoid holding the password in state for a controlled
 * input, but in v2.0.0 TLS ensures it's encrypted in transit.
 *
 * Client-side validation: validateEmail() provides UX convenience only —
 * it is NOT a security control. The backend is the authority for validation.
 * An attacker can bypass client-side validation trivially (DevTools console,
 * curl, Postman) and send arbitrary data to the API.
 *
 * VULN (v0.1.5): No password strength validation. The frontend does not
 *       enforce minimum length, complexity, or any password requirements.
 *       A user can register with "a" as their password. The backend also
 *       has no requirements (CWE-521), so there is zero password strength
 *       enforcement anywhere in the stack.
 *       CWE-521 (Weak Password Requirements) | A07:2025
 *       Remediation (v2.0.0): Client-side strength meter (UX only) +
 *       server-side validation via class-validator (@MinLength(12), etc.)
 *
 * Form data in Network tab: The full request payload { email, username,
 * password } is visible in the browser's Network tab as a JSON body. In
 * v0.1.x (plain HTTP), this is also readable by any network observer.
 * CWE-319 (Cleartext Transmission) | A04:2025
 *
 * Auth response handling: On successful register/login, the response
 * (including the JWT) is passed to AuthContext.login() which stores it
 * in localStorage. The response is also visible in the Network tab.
 */
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { authRegister, authLogin } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import FormInput from '../components/ui/form-input';
import SubmitButton from '../components/ui/submit-button';
import ErrorBanner from '../components/ui/error-banner';
import SuccessBanner from '../components/ui/success-banner';

type AuthMode = 'register' | 'login';

/**
 * Client-side email format validation. UX convenience only — not a
 * security control. The backend must independently validate all input.
 * An attacker can bypass this trivially via DevTools or direct API calls.
 */
function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address';
  return null;
}

export default function AuthPage() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'register';
  const [mode, setMode] = useState<AuthMode>(initialMode);
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
      username: regUsername ? null : 'Username is required',
      password: regPassword ? null : 'Password is required',
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
      setRegSuccess(`Account created - user ID: ${res.userId}`);
      setRegEmail('');
      setRegUsername('');
      setRegPassword('');
      setRegFieldErrors({});
    } catch (err) {
      setRegError(err instanceof Error ? err.message : String(err));
    } finally {
      setRegLoading(false);
    }
  };

  // ── Login handler ───────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string | null> = {
      email: validateEmail(loginEmail),
      password: loginPassword ? null : 'Password is required',
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
      setLoginSuccess(`Signed in - user ID: ${res.userId}`);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : String(err));
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
      </div>
    </div>
  );
}
