/**
 * M8 / v2.0.0 — Structured log helpers with sensitive-field redaction.
 *
 * Security measures:
 * - CWE-532: Never log raw password / token / authorization / cookie values.
 * - Auth/admin events stay JSON-on-stdout (thin structured logging without a
 *   full Pino dependency for the lab baseline).
 */
const SENSITIVE_KEY =
  /^(password|passwd|token|accessToken|refreshToken|authorization|cookie|secret|jwt)$/i;

export function truncateSecret(value: string, visible = 4): string {
  if (!value || value.length <= visible) {
    return '***';
  }
  return `${value.slice(0, visible)}***`;
}

/** Deep-ish redact of known secret keys (one object level + nested plain objects). */
export function redactSensitive(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (SENSITIVE_KEY.test(key)) {
      out[key] = typeof value === 'string' ? truncateSecret(value) : '[REDACTED]';
      continue;
    }
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = redactSensitive(value as Record<string, unknown>);
      continue;
    }
    out[key] = value;
  }
  return out;
}

export function logAuthEvent(
  event: 'register' | 'login' | 'logout',
  details: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      event: `auth.${event}`,
      ...redactSensitive(details),
      timestamp: new Date().toISOString(),
    }),
  );
}

export function logAdminEvent(action: string, details: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      event: `admin.${action}`,
      ...redactSensitive(details),
      timestamp: new Date().toISOString(),
    }),
  );
}
