"""Northwind Intake FastAPI app (Cycle-8).

CYCLE8-PLANT: /search uses string-concat SQL for intentional sqlmap path (v1.5.0).
Blue v2.5.0: parameterize; strip weak hashes / F1. See docs/security/Cycle-8/.
"""

from __future__ import annotations

import os
from typing import Any

import psycopg2
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse

app = FastAPI(title="Northwind Intake", version="1.5.0", docs_url=None, redoc_url=None)


def _conn():
    return psycopg2.connect(
        host=os.environ.get("DB_HOST", "postgres"),
        port=int(os.environ.get("DB_PORT", "5432")),
        user=os.environ.get("DB_ADMIN_USER", "postgres"),
        password=os.environ.get("DB_ADMIN_PASSWORD", "kc-change-me-prod"),
        dbname=os.environ.get("INTAKE_DB_NAME", "kc_intake"),
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "northwind-intake"}


@app.get("/search")
def search(q: str = Query(default="", description="Staff / mailbox search")) -> JSONResponse:
    """CYCLE8-PLANT: intentional SQLi via f-string concat — do not copy to secure tip."""
    # CYCLE8-LEDGER: returns mail_users rows (L1 names + L2 password_hash for John → SMTP).
    sql = (
        "SELECT username, email, password_hash, department, notes "
        f"FROM mail_users WHERE username ILIKE '%{q}%' OR email ILIKE '%{q}%' "
        "OR department ILIKE '%{q}%' OR notes ILIKE '%{q}%' "
        "ORDER BY username LIMIT 50"
    )
    try:
        with _conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql)
                cols = [d[0] for d in cur.description]
                rows: list[dict[str, Any]] = [dict(zip(cols, r)) for r in cur.fetchall()]
        return JSONResponse({"query": q, "count": len(rows), "results": rows})
    except Exception as exc:  # noqa: BLE001 — lab tip surfaces DB errors for sqlmap
        return JSONResponse(
            status_code=500,
            content={"error": str(exc), "sql": sql},
        )
