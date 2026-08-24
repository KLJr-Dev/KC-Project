# Security Cycle 3 — `ctf/leak-crack-db`

**Status:** Implemented on branch **`ctf/leak-crack-db`** (base tag `v2.1.0`). Product version stays **v2.1.0** (no bump for CTF-only work).

| Artifact | Path |
|----------|------|
| **Box plan** | [Dev/ctf-leak-crack-db-box-plan.md](Dev/ctf-leak-crack-db-box-plan.md) |
| Player brief (no spoilers) | [Dev/v1-leak-crack-db-player-brief.md](Dev/v1-leak-crack-db-player-brief.md) |
| Ground truth (spoilers) | [Dev/v1-leak-crack-db-ground-truth.md](Dev/v1-leak-crack-db-ground-truth.md) |
| PenTest scope | [PenTest/scope.md](PenTest/scope.md) |
| Ready gate | [../../release/leak-crack-db-ctf-ready.md](../../release/leak-crack-db-ctf-ready.md) |
| Bucket B | [../Cycle-2/Remediation/future-ctf-candidates.md](../Cycle-2/Remediation/future-ctf-candidates.md) |

## Chain (one line)

Login → **Sharing** (hash) → **My Files search** (sqlmap → local) → **John** → **psql** (proof).

## Deploy

```bash
git checkout ctf/leak-crack-db
cp infra/.env.example infra/.env
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.ctf-leak.yml up -d --build
./infra/ctf-leak-examiner.sh
```

## Team folders

| Folder | Purpose |
|--------|---------|
| [Dev/](Dev/) | Box plan, ground truth, player brief |
| [PenTest/](PenTest/) | Scope, notes, screenshots, writeup |
| Remediation/ | Fix map + Blue plan (after Red) |

## References

- Cycle-2 (closed): [../Cycle-2/README.md](../Cycle-2/README.md)
