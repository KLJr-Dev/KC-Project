# CYCLE10-PLANT — db-archive stale Postgres (DATA). SoftDev B4; B8 loads LIVE rows.
FROM postgres:16-alpine

ENV POSTGRES_USER=archive \
    POSTGRES_PASSWORD=archive-b4-stub \
    POSTGRES_DB=northwind_archive

COPY init/ /docker-entrypoint-initdb.d/

# No host publish — net_data internal only. docproc→archive fw exception in B5.
