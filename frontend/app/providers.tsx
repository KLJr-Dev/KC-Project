'use client';

import { AuthProvider } from '../lib/auth-context';
import { ThemeProvider } from '../lib/theme-context';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
