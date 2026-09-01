"""Shared Intake DB helper."""

from __future__ import annotations

import os

import psycopg2


def conn():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        port=int(os.environ.get("DB_PORT", "5432")),
        user=os.environ.get("DB_ADMIN_USER", "postgres"),
        password=os.environ.get("DB_ADMIN_PASSWORD", "kc-change-me-prod"),
        dbname=os.environ.get("INTAKE_DB_NAME", "kc_intake"),
    )
