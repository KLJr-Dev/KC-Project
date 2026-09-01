"""Northwind Intake FastAPI app (Cycle-9 SoftDev / v1.6.0 insecure tip).

Staff directory search stays parameterized (no SQLi). Onboarding plants live in
onboarding.py / security_routes.py. Edge is Nest BFF — see ADR-038.
"""

from __future__ import annotations

from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import JSONResponse

from . import onboarding, security_routes
from .db import conn

app = FastAPI(title="Northwind Intake", version="1.6.0", docs_url=None, redoc_url=None)

_MAX_QUERY_LEN = 200

app.include_router(onboarding.router)
app.include_router(security_routes.router)


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
        with conn() as c:
            with c.cursor() as cur:
                cur.execute(sql, (pattern, pattern, pattern, pattern))
                cols = [d[0] for d in cur.description]
                rows: list[dict[str, Any]] = [dict(zip(cols, r)) for r in cur.fetchall()]
        return JSONResponse({"query": q, "count": len(rows), "results": rows})
    except Exception:
        return JSONResponse(status_code=500, content={"error": "search failed"})
