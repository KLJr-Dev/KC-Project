# Frontend App Directory (`app/`)

Next.js App Router — **v1.0.0 product UI** on main routes; API explorers at `/dev/*`.

## Product routes

| Route | Purpose |
|-------|---------|
| `/` | Home — role-aware dashboard |
| `/auth` | Register / sign in + demo accounts |
| `/files` | My Files — client-scoped list (`file-scope.ts`) |
| `/files/[id]` | File detail — access-denied banner for non-owners |
| `/sharing` | My Shares — own shares + shareable files |
| `/share/[token]` | Public share landing (friendly URL) |
| `/moderator` | Review queue (mod/admin) |
| `/admin` | Admin dashboard + system-wide files |

## Dev / pentest routes

| Route | Purpose |
|-------|---------|
| `/dev` | API explorer hub + OpenAPI link |
| `/dev/files` | Raw files API UI |
| `/dev/users`, `/dev/users/[id]` | Raw users API UI |
| `/dev/sharing`, `/dev/sharing/[id]` | Raw sharing API UI |

`/users` redirects to `/dev/users`.

All API calls go through `lib/api.ts`. Types from OpenAPI via `lib/types.gen.ts`.
