"""Security Ops feed — authz + redaction (Cycle-9 Blue / v2.6.0)."""

from __future__ import annotations

import re
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse

from .db import conn
from .identity import HopIdentity, hop_identity

router = APIRouter()

_SECRETISH = re.compile(
    r"(OS\{[0-9a-fA-F]{32}\}|bearer\s+[A-Za-z0-9._\-]+|eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+)",
    re.IGNORECASE,
)


def _redact(detail: str | None) -> str | None:
    if detail is None:
        return None
    return _SECRETISH.sub("[redacted]", detail)


@router.get("/security/events", tags=["security"])
def security_events(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    if not identity.is_privileged:
        raise HTTPException(status_code=403, detail="moderator or admin role required")

    with conn() as c:
        with c.cursor() as cur:
            cur.execute(
                "SELECT id, ts, action, actor, detail FROM security_events ORDER BY id"
            )
            cols = [d[0] for d in cur.description]
            events: list[dict[str, Any]] = []
            for row in cur.fetchall():
                item = dict(zip(cols, row))
                item["id"] = str(item["id"])
                if isinstance(item.get("ts"), datetime):
                    item["ts"] = item["ts"].isoformat()
                item["detail"] = _redact(item.get("detail"))
                events.append(item)
    return JSONResponse({"count": len(events), "events": events})


@router.get("/security/metrics", tags=["security"])
def security_metrics(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    if not identity.is_privileged:
        raise HTTPException(status_code=403, detail="moderator or admin role required")

    with conn() as c:
        with c.cursor() as cur:
            cur.execute("SELECT COUNT(*) FROM onboarding_requests")
            req_count = int(cur.fetchone()[0])
            cur.execute("SELECT COUNT(*) FROM security_events")
            evt_count = int(cur.fetchone()[0])
    return JSONResponse(
        {
            "uptime_hours": 168,
            "open_requests": req_count,
            "events_ingested": evt_count,
            "posture": "nominal",
        }
    )
