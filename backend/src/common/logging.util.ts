export function truncateSecret(value: string, visible = 4): string {
  if (!value || value.length <= visible) {
    return '***';
  }
  return `${value.slice(0, visible)}***`;
}

export function logAuthEvent(
  event: 'register' | 'login' | 'logout',
  details: Record<string, unknown>,
): void {
  console.log(
    JSON.stringify({
      event: `auth.${event}`,
      ...details,
      timestamp: new Date().toISOString(),
    }),
  );
}

export function logAdminEvent(action: string, details: Record<string, unknown>): void {
  console.log(
    JSON.stringify({
      event: `admin.${action}`,
      ...details,
      timestamp: new Date().toISOString(),
    }),
  );
}
