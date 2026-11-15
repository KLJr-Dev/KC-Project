# Cycle-10 SoftDev B4 — db-archive (DATA LIVE debt)
# Host: db-archive.northwind.lab · postgres:16-alpine · unpublished
# Reachable from docproc via net_data NIC exception (graded path after proof)
# B8 loads fuller LIVE identity rows; init seeds weak defaults for enum
# Marker: CYCLE10-PLANT
# @see init/01-schema.sql · v1.10.0-credential-ledger.md
FROM postgres:16-alpine

ENV POSTGRES_USER=archive \
    POSTGRES_PASSWORD=postgres \
    POSTGRES_DB=northwind_archive

COPY init/ /docker-entrypoint-initdb.d/
