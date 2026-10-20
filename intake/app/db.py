"""Shared Intake DB helper — runtime uses least-priv `kc_intake_app` (Wave B)."""

from __future__ import annotations

import os

import psycopg2


def conn():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        port=int(os.environ.get("DB_PORT", "5432")),
        user=os.environ.get("INTAKE_DB_USER", os.environ.get("DB_USER", "kc_intake_app")),
        password=os.environ.get(
            "INTAKE_DB_PASSWORD",
            os.environ.get("DB_PASSWORD", "kc-intake-app-change-me"),
        ),
        dbname=os.environ.get("INTAKE_DB_NAME", "kc_intake"),
    )
