# Demo Users (v0.9+)

Seeded automatically via migrations on backend startup (`migrationsRun: true`).

**Cycle-1 ground truth:** [Cycle-1/Dev/v1.0.0-ground-truth.md](../security/Cycle-1/Dev/v1.0.0-ground-truth.md) — full endpoint matrix, repro steps, seeded artifact IDs.

## Accounts

| Role | Email | Password | Username | ID |
|------|-------|----------|----------|-----|
| User | `user@kc.test` | `UserPass123!` | `demo_user` | 9001 |
| Moderator | `mod@kc.test` | `ModPass123!` | `demo_mod` | 9002 |
| Admin | `admin@kc.test` | `AdminPass123!` | `demo_admin` | 9003 |
| User (other) | `other@kc.test` | `OtherPass123!` | `demo_other` | 9004 |

Passwords stored plaintext in v1.0.0 (intentional); v2.0.0 still uses demo accounts for journeys.

## Seeded files (migration `1771440000000-SeedDemoFilesAndShares`)

| Owner | File | Status | Notes |
|-------|------|--------|-------|
| demo_user (9001) | `welcome.txt` | approved | Public share (unguessable demo token — see below) |
| demo_user (9001) | `pending-doc.pdf` | pending | Appears in mod Review queue |
| demo_mod (9002) | `mod-notes.txt` | approved | Private share (no public link) |
| demo_other (9004) | `other-user-secret.txt` | approved | Own-file only (cross-user API access denied in v2.0.0) |

## Public share URL (v2.0.0)

Token is a 64-char hex constant (not `share-N`):

```
c8f3a1e9b72d4f06a5e18c903d6b47e2f1a0c9d8b7e6f5a4938271605f4e3d2c
```

```
http://localhost:8080/api/sharing/public/c8f3a1e9b72d4f06a5e18c903d6b47e2f1a0c9d8b7e6f5a4938271605f4e3d2c
http://localhost:8080/share/c8f3a1e9b72d4f06a5e18c903d6b47e2f1a0c9d8b7e6f5a4938271605f4e3d2c
```

Legacy `share-1` returns **404**.

## Per-role expected UI

**User (`user@kc.test`):** Sign in → My Files shows **2 files** (welcome.txt, pending-doc.pdf) — not other users' files. Sharing → create link from own files. Public link for welcome.txt uses the unguessable demo token above.

**Moderator (`mod@kc.test`):** Sign in → Review → **1 pending** file (pending-doc.pdf). No global file browser in nav. Can download files in the review queue.

**Admin (`admin@kc.test`):** Sign in → Admin → **All files** section shows every upload system-wide (4 seeded + any user uploads). Users, stats, audit log unchanged.

**Other user (`other@kc.test`):** Sign in → My Files shows only `other-user-secret.txt`.

## API vs product UI

The product UI filters files/shares by `ownerId` client-side. `GET /files` still returns **all** files to any authenticated user (intentional IDOR). Pentesters discover this via `/dev`, Burp, or curl. See [pentest-journeys.md](pentest-journeys.md).

On the auth page, use **Show demo accounts** for one-click credential fill.
