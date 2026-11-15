# Cycle-10 lab hosts (`v1.10.0`)

**Authority:** [ADR-039](../../docs/decisions/ADR-039-cycle-10-enterprise-pair.md) · [topology](../../docs/diagrams/c10-v1.10.0-topology.md) · [reachability](../../docs/security/Cycle-10/Dev/v1.10.0-reachability-matrix.md)

**Compose:** [`../docker-compose.cycle10-lab.yml`](../docker-compose.cycle10-lab.yml) — SoftDev lab entrypoint (overlay on prod during build-out).

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle10-lab.yml up -d --build
./infra/assert-cycle10-unpublished.sh   # prod-alone must stay clean
./infra/cycle10-b2-smoke.sh             # B2 MANAGEMENT gate
./infra/cycle10-b3-smoke.sh             # B3 CORPORATE gate
./infra/cycle10-b4-smoke.sh             # B4 DATA (db-archive) gate
./infra/cycle10-b5-smoke.sh             # B5 docproc gate
./infra/cycle10-b7-smoke.sh             # B7 DMZ gate
./infra/cycle10-inventory.sh            # runtime versions / FS dump
```

**Host inventory:** [HOST-INVENTORY.md](./HOST-INVENTORY.md) · runtime dump [HOST-INVENTORY.runtime.md](./HOST-INVENTORY.runtime.md)

**Clean slate:**
```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle10-lab.yml down --remove-orphans -v
./infra/cycle10-b7-smoke.sh
```

## Role table

| Compose service | DNS (`*.northwind.lab`) | Zone | Tag | Step | Notes |
|-----------------|-------------------------|------|-----|------|-------|
| `c10-fw` | `fw` | — | SUPPORT | B1 | Zone firewall; bridges ≠ allowlist |
| `c10-bastion` | `bastion` | MGMT | LIVE crown | B2 | iptables: SSH **only** from `integrate`; no host ports |
| `c10-logs` / `c10-backup` | `logs` / `backup` | MGMT | SUPPORT | B2 | Stubs — no graded secrets |
| `c10-ws-admin` | `ws-admin` | CORP | NOISE | B2/B3 | Sticky-note decoy; **not** on net_mgmt |
| `c10-integrate` | `integrate` | CORP+APP(+MGMT NIC) | LIVE OS | B3 | Dual-home + sole bastion path; not a router |
| `c10-mail` | `mail` | CORP | LIVE | B3/B8 | Required ops thread |
| `c10-files` | `files` | CORP | LIVE | B3/B8 | Samba dept share |
| `c10-ws-accounting` / `c10-ftp-warehouse` / `c10-mon-legacy` | noise hosts | CORP | NOISE | B3 | Clutter shells |
| `c10-db-archive` | `db-archive` | DATA | LIVE debt | B4 | Stale restore; `docproc` exception |
| `c10-docproc` | `docproc` | APP | LIVE OS | B5 | Helper + local/proof |
| `c10-edge` | `edge` | DMZ | LIVE entry | B7 | Weak HTTPS **`:8443`** |
| `c10-partners` | `partners` | DMZ | LIVE debt / side | B7 | SFTP **`:2122`** — cannot skip web |
| `c10-honeypot` | `honeypot` | DMZ | DECOY | B7 | SSH decoy **`:2223`** |

Product containers (`portal`/`api`/`intake`/…) stay defined in prod compose; lab overlay attaches them to zone nets as SoftDev progresses (B6–B7).

## Markers

`CYCLE10-PLANT` · `CYCLE10-NOISE` · `CYCLE10-DECOY` · `CYCLE10-SUPPORT`

## Layout

```text
cycle10/
  README.md
  fw/           # B1 — iptables entrypoint
  HOST-INVENTORY.md
  bastion/ logs/ backup/ ws-admin/
  integrate/ mail/ files/ ws-accounting/ ftp-warehouse/ mon-legacy/
  db-archive/ docproc/
  edge/ partners/ honeypot/
  seeds/        # B8
```
