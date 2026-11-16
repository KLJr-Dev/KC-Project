# Cycle-10 lab — host inventory (`v2.10.0` Blue)

**Authority:** [v2 reachability](../../docs/security/Cycle-10/Dev/v2.10.0-reachability-matrix.md) · [README](./README.md)  
**Refresh runtime facts:** `./infra/cycle10-inventory.sh` → [`HOST-INVENTORY.runtime.md`](./HOST-INVENTORY.runtime.md)

Base image pin for Alpine hosts: **`alpine:3.20`**. Edge: **`nginx:1.27-alpine`**. Archive: **`postgres:16-alpine`**.

| Service | DNS | Zone | Users | Key notes | Listen | Host publish |
|---------|-----|------|-------|-----------|--------|--------------|
| `c10-fw` | `fw.northwind.lab` | all NICs | root | FORWARD default-deny | — | none |
| `c10-bastion` | `bastion.northwind.lab` | MGMT | `nwadmin` | SSH only from integrate; **no sudo ALL**; no graded crown | `:22` | **none** |
| `c10-logs` | `logs.northwind.lab` | MGMT | root | collectors | — | none |
| `c10-backup` | `backup.northwind.lab` | MGMT | root | backup | — | none |
| `c10-ws-admin` | `ws-admin.northwind.lab` | CORP | `helpdesk` | helpdesk desktop | `:22` | none |
| `c10-integrate` | `integrate.northwind.lab` | APP+CORP+MGMT | `integrator` | jump host; vault-issued SSH | `:22` | none |
| `c10-mail` | `mail.northwind.lab` | CORP | `mailer` | maildir (no password loot) | — | none |
| `c10-files` | `files.northwind.lab` | CORP | `smbuser` | Samba; strong share secret | `:445` | none |
| `c10-ws-accounting` | `ws-accounting.northwind.lab` | CORP | `ledger` | workstation | `:22` | none |
| `c10-ftp-warehouse` | `ftp-warehouse.northwind.lab` | CORP | `warehouse` | vsftpd | `:21` | none |
| `c10-mon-legacy` | `mon-legacy.northwind.lab` | CORP | root | busybox httpd | `:8080` | none |
| `c10-db-archive` | `db-archive.northwind.lab` | DATA | `archive` | strong `ARCHIVE_DB_PASSWORD` | `:5432` | none |
| `c10-docproc` | `docproc.northwind.lab` | **APP only** | `docuser` | non-root helper; allowlisted `file` argv; no sudo | `:9090` | none |
| `c10-edge` | `edge.northwind.lab` | DMZ(+APP) | nginx | HSTS/CSP; sole publish | `:443` | **`443→443`** |
| `c10-partners` | `partners.northwind.lab` | DMZ | `vendor` | SFTP | `:22` | **none** |
| `c10-honeypot` | `honeypot.northwind.lab` | DMZ | decoy accounts | unpublished | `:2222` | **none** |

## Credentials (Blue tip)

All host passwords come from compose build-args / env (`BASTION_SSH_PASSWORD`, `ARCHIVE_DB_PASSWORD`, `INTEGRATE_SSH_PASSWORD`, `SMB_PASSWORD`, …). **No** shared plant secrets across hosts. Product demo accounts remain in `docs/deploy/demo-users.md` (out-of-band for CI).

## Networks

| Compose net | `internal` | Members (Blue) |
|-------------|------------|----------------|
| `net_dmz` | no | fw, edge, partners, honeypot |
| `net_app` | no | fw, integrate, **docproc**, edge, backend/frontend |
| `net_data` | **yes** | fw, db-archive (**not** docproc) |
| `net_corp` | **yes** | fw, integrate, mail, files, workstations |
| `net_mgmt` | **yes** | fw, bastion, logs, backup, integrate |

## Hard gates

- Bastion SSH: iptables INPUT allow **only** `integrate` IP; no host publish.
- **docproc ↛ db-archive** (no `net_data` NIC on docproc).
- Internet: only **443** on host (edge HTTPS).
