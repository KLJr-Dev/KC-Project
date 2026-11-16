# Cycle-10 lab — host inventory (`v1.10.0`)

**Authority:** [topology](../../docs/diagrams/c10-v1.10.0-topology.md) · [README](./README.md)  
**Refresh runtime facts:** `./infra/cycle10-inventory.sh` → [`HOST-INVENTORY.runtime.md`](./HOST-INVENTORY.runtime.md)

Base image pin for Alpine hosts: **`alpine:3.20`**. Edge: **`nginx:1.27-alpine`** (runtime **nginx/1.27.5** on Alpine 3.21). Archive: **`postgres:16-alpine`** (runtime **16.15**). Samba **4.19.9**. docproc **Python 3.12.13**.

| Service | DNS | Zone | Base / runtime | Users | Key filesystem | Listen | Host publish |
|---------|-----|------|----------------|-------|----------------|--------|--------------|
| `c10-fw` | `fw.northwind.lab` | all NICs | alpine 3.20 + iptables | root | `/entrypoint.sh` | — | none |
| `c10-bastion` | `bastion.northwind.lab` | MGMT | alpine 3.20 + openssh + iptables + sudo | `nwadmin` | `/root/crown.txt` (600) · sudo ALL (passwd) | `:22` | **none** |
| `c10-logs` | `logs.northwind.lab` | MGMT | alpine 3.20 | root | `/var/log/northwind/*` | — | none |
| `c10-backup` | `backup.northwind.lab` | MGMT | alpine 3.20 | root | `/backup/northwind/*` | — | none |
| `c10-ws-admin` | `ws-admin.northwind.lab` | CORP | alpine 3.20 + openssh | `helpdesk` | `/home/helpdesk/sticky-note.txt` | `:22` | none |
| `c10-integrate` | `integrate.northwind.lab` | APP+CORP+MGMT | alpine 3.20 + openssh/curl | `integrator` | `/opt/northwind/ROLE` | `:22` | none |
| `c10-mail` | `mail.northwind.lab` | CORP | alpine 3.20 (maildir) | `mailer` | `/var/mail/northwind/{ops,it}/` | — | none |
| `c10-files` | `files.northwind.lab` | CORP | alpine 3.20 + samba 4.19 | `smbuser` | `/shares/dept` · `/shares/legacy` | `:445` | none |
| `c10-ws-accounting` | `ws-accounting.northwind.lab` | CORP | alpine 3.20 + openssh | `ledger` | `/home/ledger/README` | `:22` | none |
| `c10-ftp-warehouse` | `ftp-warehouse.northwind.lab` | CORP | alpine 3.20 + vsftpd | `warehouse` | `/var/ftp/pub` | `:21` | none |
| `c10-mon-legacy` | `mon-legacy.northwind.lab` | CORP | alpine 3.20 + busybox httpd | root | `/www/index.html` | `:8080` | none |
| `c10-db-archive` | `db-archive.northwind.lab` | DATA | postgres 16-alpine | `archive` | PGDATA · init `01-schema.sql` | `:5432` | none |
| `c10-docproc` | `docproc.northwind.lab` | APP+DATA | alpine 3.20 + python3 + sudo | `docuser` | `/home/docuser/local.txt` · `/root/proof.txt` · `/root/bastion.secret` · `/opt/docproc/bin/helper.py` | `:9090` | none |
| `c10-edge` | `edge.northwind.lab` | DMZ(+APP) | nginx 1.27-alpine + openssl | nginx | `/etc/nginx/nginx.conf` · `/usr/share/nginx/html/` | `:443` | **`443→443` (sole publish)** |
| `c10-partners` | `partners.northwind.lab` | DMZ | alpine 3.20 + openssh-sftp | `vendor` | `/var/sftp/incoming` (chroot) | `:22` | **none** |
| `c10-honeypot` | `honeypot.northwind.lab` | DMZ | alpine 3.20 + openssh | `tempuser`/`hpadmin`/`rootish` | `/opt/remote/NOTICE` | `:2222` | **none** |

## Credentials (weak / default — John/rockyou class)

| Host | User | Password | Notes |
|------|------|----------|-------|
| bastion | `nwadmin` | `Welcome1` | SSH + **sudo** (same pass). Secret also in `docproc:/root/bastion.secret` |
| integrate | `integrator` | `Passw0rd` | Dual-home path host |
| files (Samba) | `smbuser` | `password` | `/shares/dept/integration/JUMPBOX.txt` → integrate |
| partners SFTP | `vendor` | `vendor` | Cannot skip web gate |
| docproc | `docuser` | `changeme` | Helper `:9090`; `sudo find` PrivEsc |
| db-archive | `archive` | `postgres` | Internal `net_data` only |
| ws-admin | `helpdesk` | `Summer2024` | Sticky-note claims this is bastion — rejected there |
| published `:2223` | `tempuser` / `hpadmin` / `rootish` | `guest` / `admin` / `Summer2024` | — |
| ws-accounting | `ledger` | `Account1ng!` | — |
| ftp-warehouse | `warehouse` | `shipit` | Not partners SFTP |

Bastion rejects `Summer2024`.

## Networks

| Compose net | Docker name | `internal` | Members |
|-------------|-------------|------------|---------|
| `net_dmz` | `nw_c10_dmz` | no | fw, edge, partners, honeypot |
| `net_app` | `nw_c10_app` | no | fw, integrate, docproc, edge, backend/frontend aliases |
| `net_data` | `nw_c10_data` | **yes** | fw, db-archive, docproc |
| `net_corp` | `nw_c10_corp` | **yes** | fw, integrate, mail, files, workstations |
| `net_mgmt` | `nw_c10_mgmt` | **yes** | fw, bastion, logs, backup, integrate |

## Hard gates

- Bastion SSH: iptables INPUT allow **only** `integrate` IP; no host publish.
- `docproc`→`db-archive`: shared `net_data` NIC.
- Internet: only **443** on host (edge HTTPS). Partners/honeypot unpublished.
