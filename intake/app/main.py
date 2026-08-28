"""Northwind Intake FastAPI app (Cycle-8 Blue / v2.5.0).

Staff directory search behind /api/intake/. Parameterized queries; no hash columns in API.
@see docs/security/Cycle-8/Remediation/v2.5.0-remediation.md
"""

from __future__ import annotations

import os
from typing import Any

import psycopg2
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse

app = FastAPI(title="Northwind Intake", version="2.5.0", docs_url=None, redoc_url=None)

_MAX_QUERY_LEN = 200


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
    return {"status": "ok", "service": "northwind-intake", "version": "2.5.0"}


@app.get("/search")
def search(q: str = Query(default="", description="Staff / mailbox search")) -> JSONResponse:
    """Directory search — parameterized; password_hash never returned."""
    if len(q) > _MAX_QUERY_LEN:
        raise HTTPException(status_code=400, detail="query too long")

    pattern = f"%{q}%"
    sql = (
        "SELECT username, email, department, notes "
        "FROM mail_users "
        "WHERE username ILIKE %s OR email ILIKE %s OR department ILIKE %s OR notes ILIKE %s "
        "ORDER BY username LIMIT 50"
    )
    try:
        with _conn() as conn:
            with conn.cursor() as cur:
                cur.execute(sql, (pattern, pattern, pattern, pattern))
                cols = [d[0] for d in cur.description]
                rows: list[dict[str, Any]] = [dict(zip(cols, r)) for r in cur.fetchall()]
        return JSONResponse({"query": q, "count": len(rows), "results": rows})
    except Exception:
        return JSONResponse(status_code=500, content={"error": "search failed"})
