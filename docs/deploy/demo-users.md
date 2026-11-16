# Demo Users — CI / local-dev only

**Not on the secure tip.** Showcase compose sets `ALLOW_PUBLIC_REGISTER=0` and `NEXT_PUBLIC_ENABLE_LAB_UI=0`. Client builds do **not** embed passwords.

Seeded via migrations (`migrationsRun: true`) for local/CI. Cleartext below is for operators spinning non-tip stacks — never commit tip env with these as production login shortcuts.

## Accounts (dev/CI)

| Role | Email | Password | Username | ID |
|------|-------|----------|----------|-----|
| User | `user@kc.test` | `UserPass123!` | `demo_user` | 9001 |
| Moderator | `mod@kc.test` | `ModPass123!` | `demo_mod` | 9002 |
| Admin | `admin@kc.test` | `AdminPass123!` | `demo_admin` | 9003 |
| User (other) | `other@kc.test` | `OtherPass123!` | `demo_other` | 9004 |

Passwords are **bcrypt-hashed** in the DB. Tip users are admin-provisioned (or access-request approve) when public register is off.

## Secure tip (`v2.10.0`)

- No quick-fill UI (`NEXT_PUBLIC_ENABLE_LAB_UI=false`).
- Inject CI credentials via env / secrets — do not bake into frontend modules.
- See [v2.10.0-secure-ready.md](../release/v2.10.0-secure-ready.md).
