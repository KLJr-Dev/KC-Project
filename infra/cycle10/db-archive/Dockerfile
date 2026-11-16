# Cycle-10 Blue — db-archive (DATA)
# Host: db-archive.northwind.lab · unpublished
# Password from compose POSTGRES_PASSWORD / ARCHIVE_DB_PASSWORD (never postgres).
FROM postgres:16-alpine

ENV POSTGRES_USER=archive \
    POSTGRES_DB=northwind_archive

COPY init/ /docker-entrypoint-initdb.d/
