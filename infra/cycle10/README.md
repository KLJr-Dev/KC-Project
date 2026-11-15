# Cycle-10 lab hosts (`v1.10.0`)

**Authority:** [ADR-039](../../docs/decisions/ADR-039-cycle-10-enterprise-pair.md) · [topology](../../docs/diagrams/c10-v1.10.0-topology.md) · [reachability](../../docs/security/Cycle-10/Dev/v1.10.0-reachability-matrix.md)

**Compose:** [`../docker-compose.cycle10-lab.yml`](../docker-compose.cycle10-lab.yml) — lab overlay on prod.

```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle10-lab.yml up -d --build
./infra/assert-cycle10-unpublished.sh   # prod-alone must stay clean
./infra/cycle10-b2-smoke.sh             # B2 MANAGEMENT gate
./infra/cycle10-b3-smoke.sh             # B3 CORPORATE gate
./infra/cycle10-b4-smoke.sh             # B4 DATA (db-archive) gate
./infra/cycle10-b5-smoke.sh             # B5 docproc gate
./infra/cycle10-b7-smoke.sh             # B7 DMZ gate
./infra/cycle10-b8-smoke.sh             # B8 seeds (mail/files/archive)
./infra/cycle10-reachability.sh         # B9 matrix samples
./infra/cycle10-examiner.sh             # B9 examiner (infra + Nest packets A–D)
./infra/cycle10-inventory.sh            # runtime versions / FS dump
```

**Host inventory:** [HOST-INVENTORY.md](./HOST-INVENTORY.md) · runtime dump [HOST-INVENTORY.runtime.md](./HOST-INVENTORY.runtime.md)

**Clean slate:**
```bash
docker compose -f infra/docker-compose.prod.yml -f infra/docker-compose.cycle10-lab.yml down --remove-orphans -v
./infra/cycle10-b7-smoke.sh
```

## Hosts

| Compose service | DNS (`*.northwind.lab`) | Zone | Notes |
|-----------------|-------------------------|------|-------|
| `c10-fw` | `fw` | — | Zone firewall; bridges ≠ allowlist |
| `c10-bastion` | `bastion` | MGMT | iptables: SSH **only** from `integrate`; no host ports |
| `c10-logs` / `c10-backup` | `logs` / `backup` | MGMT | Ops collectors |
| `c10-ws-admin` | `ws-admin` | CORP | Helpdesk sticky-note; **not** on net_mgmt |
| `c10-integrate` | `integrate` | CORP+APP(+MGMT NIC) | Dual-home + sole bastion path; not a router |
| `c10-mail` | `mail` | CORP | Ops thread + runbook |
| `c10-files` | `files` | CORP | Samba dept share |
| `c10-ws-accounting` / `c10-ftp-warehouse` / `c10-mon-legacy` | — | CORP | Extra corp hosts |
| `c10-db-archive` | `db-archive` | DATA | Stale restore; `docproc` exception |
| `c10-docproc` | `docproc` | APP | Helper + local/proof |
| `c10-edge` | `edge` | DMZ | Weak HTTPS **`:443`** — **sole host publish** |
| `c10-partners` | `partners` | DMZ | SFTP theater — **unpublished** |
| `c10-honeypot` | `honeypot` | DMZ | SSH decoy — **unpublished** |

Product containers (`portal`/`api`/`intake`/…) stay in prod compose; lab overlay attaches them to zone nets as needed.

## Layout

```text
cycle10/
  README.md
  fw/
  HOST-INVENTORY.md
  bastion/ logs/ backup/ ws-admin/
  integrate/ mail/ files/ ws-accounting/ ftp-warehouse/ mon-legacy/
  db-archive/ docproc/
  edge/ partners/ honeypot/
  seeds/
```
