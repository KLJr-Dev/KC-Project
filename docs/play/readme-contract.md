# Tip README contract (portfolio)

Use this shape on **every** product tip (`v1.x` / `v2.x` / `ctf/*` / `remediation/*`). Hierarchy: **README → supporting docs → rest**.

```markdown
# <Title> — <Insecure tip | Secure tip | CTF archive>

## What this is
<!-- Cycle N · product face · one sentence role -->

## Skills practiced
- …
- …

## What you will learn
- …
- …

## Run
```bash
git checkout <ref>
cp infra/.env.example infra/.env
# compose block — exact ports/overlays for THIS tip
```

## Play / verify
<!-- Red: player brief (no spoilers). Blue: assert/smoke commands. -->

## Supporting docs
<!-- ≤7 links: brief, ground truth, ADR, remediation, diagram, gate -->

## Rest of documentation
→ [docs/INDEX.md](../INDEX.md) (on `main`) or cycle folder README in-tree

## Spoiler policy
Unmarked = safe while playing. Links marked **`[SPOILER]`** = writeups / full fix maps / flags.

## SSDLC
Sister tip: `v1.N.0` ↔ `v2.N.0` (or “CTF-only — no product version bump”).
```

Catalogs: [red-team.md](red-team.md) · [blue-team.md](blue-team.md).
