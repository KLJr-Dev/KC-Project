# Cycle-10 runtime inventory — 2026-11-15T20:06:26Z

## c10-fw
- image: `infra-c10-fw`
- networks: `nw_c10_app nw_c10_corp nw_c10_data nw_c10_dmz nw_c10_mgmt `
- published: `none`
- uname: Linux fw.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:

## c10-bastion
- image: `infra-c10-bastion`
- networks: `nw_c10_mgmt `
- published: `none`
- uname: Linux bastion.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - -rw-------    1 root     root            37 Nov 15 20:01 /root/crown.txt

## c10-logs
- image: `infra-c10-logs`
- networks: `nw_c10_mgmt `
- published: `none`
- uname: Linux logs.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - -rw-r--r--    1 root     root            49 Nov 15 20:01 /var/log/northwind/README

## c10-backup
- image: `infra-c10-backup`
- networks: `nw_c10_mgmt `
- published: `none`
- uname: Linux backup.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - -rw-r--r--    1 root     root            37 Nov 15 20:01 /backup/northwind/README

## c10-ws-admin
- image: `infra-c10-ws-admin`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux ws-admin.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:

## c10-integrate
- image: `infra-c10-integrate`
- networks: `nw_c10_app nw_c10_corp nw_c10_mgmt `
- published: `none`
- uname: Linux integrate.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - -rw-r--r--    1 root     root           174 Nov 15 20:01 /opt/northwind/ROLE

## c10-mail
- image: `infra-c10-mail`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux mail.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - drwxr-xr-x    4 root     root          4096 Nov 15 20:01 /var/mail/northwind

## c10-files
- image: `infra-c10-files`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux files.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- Version 4.19.9
- os: Alpine Linux v3.20
- key paths:
  - drwxr-xr-x    1 root     root          4096 Nov 15 20:01 /shares/dept

## c10-ws-accounting
- image: `infra-c10-ws-accounting`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux ws-accounting.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:

## c10-ftp-warehouse
- image: `infra-c10-ftp-warehouse`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux ftp-warehouse.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:

## c10-mon-legacy
- image: `infra-c10-mon-legacy`
- networks: `nw_c10_corp `
- published: `none`
- uname: Linux mon-legacy.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:

## c10-db-archive
- image: `infra-c10-db-archive`
- networks: `nw_c10_data `
- published: `none`
- uname: Linux db-archive.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- psql (PostgreSQL) 16.15
- os: Alpine Linux v3.24
- key paths:

## c10-docproc
- image: `infra-c10-docproc`
- networks: `nw_c10_app nw_c10_data `
- published: `none`
- uname: Linux docproc.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- Python 3.12.13
- os: Alpine Linux v3.20
- key paths:
  - -rw-------    1 root     root            37 Nov 15 20:01 /root/proof.txt
  - -rw-------    1 root     root             9 Nov 15 20:01 /root/bastion.secret
  - -rw-r--r--    1 docuser  docuser         37 Nov 15 20:01 /home/docuser/local.txt
  - -rwxr-xr-x    1 root     root          3180 Nov 15 19:56 /opt/docproc/bin/helper.py

## c10-edge
- image: `infra-c10-edge`
- networks: `nw_c10_app nw_c10_dmz `
- published: `443/tcp -> 0.0.0.0:8443 `
- uname: Linux edge.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- nginx version: nginx/1.27.5
- os: Alpine Linux v3.21
- key paths:
  - -rw-r--r--    1 root     root           624 Nov 15 19:56 /usr/share/nginx/html/index.html

## c10-partners
- image: `infra-c10-partners`
- networks: `nw_c10_dmz `
- published: `22/tcp -> 0.0.0.0:2122 `
- uname: Linux partners.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - drwxr-xr-x    2 vendor   vendor        4096 Nov 15 20:01 /var/sftp/incoming

## c10-honeypot
- image: `infra-c10-honeypot`
- networks: `nw_c10_dmz `
- published: `2222/tcp -> 0.0.0.0:2223 `
- uname: Linux honeypot.northwind.lab 6.12.5-linuxkit #1 SMP Tue Jan 21 10:23:32 UTC 2025 aarch64 Linux
- os: Alpine Linux v3.20
- key paths:
  - -rw-r--r--    1 root     root            55 Nov 15 19:46 /opt/honeypot/NOTICE

