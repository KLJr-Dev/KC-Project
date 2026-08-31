"""Security theatre + SIEM leak + honeypot (Cycle-9)."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from .db import conn
from .identity import HopIdentity, hop_identity

router = APIRouter()


@router.get("/security/events", tags=["security"])
def security_events(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    """CYCLE9-PLANT: bolted-on SIEM feed may leak token/email fragments (F4)."""
    _ = identity
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
                events.append(item)
    return JSONResponse({"count": len(events), "events": events})


@router.get("/security/metrics", tags=["security"])
def security_metrics(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    """Vanity metrics — theatre support / noise."""
    _ = identity
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


@router.get("/v1/internal/debug", tags=["decoy"])
def honeypot(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    """CYCLE9-DECOY — not a graded flag; services alerted."""
    _ = identity
    return JSONResponse(
        status_code=403,
        content={
            "error": "unauthorized probe",
            "detail": "services alerted",
        },
    )
