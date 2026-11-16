import { isLabUiEnabled } from './lab-flags';

export type DemoUser = { label: string; email: string; password: string };

/**
 * Demo credentials never ship in production tip builds.
 * NEXT_PUBLIC_ENABLE_LAB_UI is compile-time — empty array when unset/false.
 */
export const DEMO_USERS: readonly DemoUser[] =
  process.env.NEXT_PUBLIC_ENABLE_LAB_UI === 'true' && isLabUiEnabled()
    ? ([
        {
          label: 'User',
          email: process.env.NEXT_PUBLIC_DEMO_USER_EMAIL || 'user@kc.test',
          password: process.env.NEXT_PUBLIC_DEMO_USER_PASSWORD || '',
        },
        {
          label: 'Moderator',
          email: process.env.NEXT_PUBLIC_DEMO_MOD_EMAIL || 'mod@kc.test',
          password: process.env.NEXT_PUBLIC_DEMO_MOD_PASSWORD || '',
        },
        {
          label: 'Admin',
          email: process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL || 'admin@kc.test',
          password: process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD || '',
        },
      ].filter((u) => u.password.length > 0) as DemoUser[])
    : [];
