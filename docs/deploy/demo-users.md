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

Passwords are **bcrypt-hashed** in the DB (v2.0.0). Cleartext values above are for lab login only — never appear in the password column after seed migrations.

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

## Seeded notes (SoftDev / Cycle-4 — migration `1777600000001-SeedDemoNotes`)

| ID | Owner | Purpose |
|----|-------|---------|
| `9201` | admin (9003) | Ops bastion note — real SSH plant + F2 |
| `9202` | admin | Decoy retired jump |
| `9203` | user (9001) | XSS scratchpad + F1 |
| `9204` | user | VPN decoy |
| `9205` | mod (9002) | Mod queue reminder |
| `9206` | other (9004) | Workshop decoy (if other user present) |

Examiner flags/SSH: [v1.2.0-ground-truth.md](../security/Cycle-4/Dev/v1.2.0-ground-truth.md) (not for player brief). UI: `/notes`.

## Per-role expected UI

**User (`user@kc.test`):** Sign in → My Files shows **2 files** (welcome.txt, pending-doc.pdf) — not other users' files. Sharing → create link from own files. Public link for welcome.txt uses the unguessable demo token above.

**Moderator (`mod@kc.test`):** Sign in → Review → **1 pending** file (pending-doc.pdf). No global file browser in nav. Can download files in the review queue.

**Admin (`admin@kc.test`):** Sign in → Admin → **All files** section shows every upload system-wide (4 seeded + any user uploads). Users, stats, audit log unchanged.

**Other user (`other@kc.test`):** Sign in → My Files shows only `other-user-secret.txt`.

## API vs product UI

The product UI filters files/shares by `ownerId` client-side. `GET /files` still returns **all** files to any authenticated user (intentional IDOR). Pentesters discover this via `/dev`, Burp, or curl. See [pentest-journeys.md](pentest-journeys.md).

On the auth page, use **Show demo accounts** for one-click credential fill.
