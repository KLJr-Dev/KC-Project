# Cycle-10 lab — host inventory (`v1.10.0` SoftDev)

**Authority:** [topology](../../docs/diagrams/c10-v1.10.0-topology.md) · [README](./README.md)  
**Compose:** `infra/docker-compose.cycle10-lab.yml`  
**Refresh runtime facts:** `./infra/cycle10-inventory.sh` → writes console dump; SoftDev snapshot: [`HOST-INVENTORY.runtime.md`](./HOST-INVENTORY.runtime.md)

Base image pin for Alpine hosts: **`alpine:3.20`**. Edge: **`nginx:1.27-alpine`** (runtime **nginx/1.27.5** on Alpine 3.21). Archive: **`postgres:16-alpine`** (runtime **16.15**). Samba **4.19.9**. docproc **Python 3.12.13**.

| Service | DNS | Zone | Tag | Base / runtime | Users | Key filesystem | Listen (container) | Host publish |
|---------|-----|------|-----|----------------|-------|----------------|--------------------|--------------|
| `c10-fw` | `fw.northwind.lab` | all NICs | SUPPORT | alpine 3.20 + iptables | root | `/entrypoint.sh` | — | none |
| `c10-bastion` | `bastion.northwind.lab` | MGMT | LIVE | alpine 3.20 + openssh + iptables | `nwadmin` | `/root/crown.txt` (600) · `/etc/motd` | `:22` | **none** |
| `c10-logs` | `logs.northwind.lab` | MGMT | SUPPORT | alpine 3.20 | root | `/var/log/northwind/*` | — | none |
| `c10-backup` | `backup.northwind.lab` | MGMT | SUPPORT | alpine 3.20 | root | `/backup/northwind/*` | — | none |
| `c10-ws-admin` | `ws-admin.northwind.lab` | CORP | NOISE | alpine 3.20 + openssh | `helpdesk` | `/home/helpdesk/sticky-note.txt` | `:22` | none |
| `c10-integrate` | `integrate.northwind.lab` | APP+CORP+MGMT | LIVE | alpine 3.20 + openssh/curl | `integrator` | `/opt/northwind/ROLE` | `:22` | none |
| `c10-mail` | `mail.northwind.lab` | CORP | LIVE | alpine 3.20 (maildir stub) | `mailer` | `/var/mail/northwind/{ops,noise}/` | — | none |
| `c10-files` | `files.northwind.lab` | CORP | LIVE | alpine 3.20 + samba 4.19 | `smbuser` | `/shares/dept` · `/shares/noise` · `/etc/samba/smb.conf` | `:445` | none |
| `c10-ws-accounting` | `ws-accounting.northwind.lab` | CORP | NOISE | alpine 3.20 + openssh | `ledger` | `/home/ledger/README` | `:22` | none |
| `c10-ftp-warehouse` | `ftp-warehouse.northwind.lab` | CORP | NOISE | alpine 3.20 + vsftpd | `warehouse` | `/var/ftp/pub` · `/etc/vsftpd/vsftpd.conf` | `:21` | none |
| `c10-mon-legacy` | `mon-legacy.northwind.lab` | CORP | NOISE | alpine 3.20 + busybox httpd | root | `/www/index.html` | `:8080` | none |
| `c10-db-archive` | `db-archive.northwind.lab` | DATA | LIVE | postgres 16-alpine | `archive` | PGDATA · init `01-schema.sql` | `:5432` | none |
| `c10-docproc` | `docproc.northwind.lab` | APP+DATA | LIVE | alpine 3.20 + python3 + sudo | `docuser` | `/home/docuser/local.txt` · `/root/proof.txt` · `/root/bastion.secret` · `/opt/docproc/bin/helper.py` · `/opt/docproc/inbox` | `:9090` | none |
| `c10-edge` | `edge.northwind.lab` | DMZ(+APP) | LIVE | nginx 1.27-alpine + openssl | nginx | `/etc/nginx/nginx.conf` · `/etc/nginx/certs/edge.{crt,key}` · `/usr/share/nginx/html/` | `:443` | **`8443→443`** |
| `c10-partners` | `partners.northwind.lab` | DMZ | LIVE | alpine 3.20 + openssh-sftp | `vendor` | `/var/sftp/incoming` (chroot) | `:22` | **`2122→22`** |
| `c10-honeypot` | `honeypot.northwind.lab` | DMZ | DECOY | alpine 3.20 + openssh | `decoy`/`hpadmin`/`rootish` | `/opt/honeypot/NOTICE` | `:2222` | **`2223→2222`** |

## SoftDev credential stubs (not final GT flags)

| Host | Stub auth | Notes |
|------|-----------|-------|
| bastion | `nwadmin` / `B2-stub-replace-at-B8` | Graded secret after docproc root (B8) |
| integrate | `integrator` / `corp-integrate-b3` | Dual-home path host |
| files | `smbuser` / `files-b3` | Samba dept share |
| partners | `vendor` / `partner-sftp-b7` | Cannot skip web gate |
| ws-admin | `helpdesk` / `Summer2024` | Decoy sticky note |
| honeypot | `decoy`/`hpadmin`/`rootish` weak | Timebox |
| db-archive | `archive` / `archive-b4-stub` | Internal only |
| docproc | `docuser` / `docproc-b5` · `sudo find` PrivEsc | Helper plant on `:9090` |

## Networks

| Compose net | Docker name | `internal` | Members (SoftDev now) |
|-------------|-------------|------------|------------------------|
| `net_dmz` | `nw_c10_dmz` | no | fw, edge, partners, honeypot |
| `net_app` | `nw_c10_app` | no | fw, integrate, docproc, edge |
| `net_data` | `nw_c10_data` | **yes** | fw, db-archive, docproc |
| `net_corp` | `nw_c10_corp` | **yes** | fw, integrate, mail, files, noise, ws-admin |
| `net_mgmt` | `nw_c10_mgmt` | **yes** | fw, bastion, logs, backup, integrate |

## Hard gates (enforcement notes)

- Bastion SSH: iptables INPUT allow **only** `integrate` IP; no host publish.
- `docproc`→`db-archive`: shared `net_data` NIC (compose exception).
- Internet: only **8443 / 2122 / 2223** on host for lab DMZ.
