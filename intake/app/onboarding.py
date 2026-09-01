"""Onboarding / HR requests — Cycle-9 plants (IDOR, race, export traversal)."""

from __future__ import annotations

import os
import time
from datetime import datetime
from typing import Any, Literal
from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from .db import conn
from .identity import HopIdentity, hop_identity

router = APIRouter(tags=["onboarding-requests"])

EXPORT_ROOT = os.environ.get("EXPORT_ROOT", "/app/exports")
# CYCLE9-PLANT F2 — only returned after header-trust privilege (not via plain IDOR).
F2_PRIVILEGE_ACK = (
    "CYCLE9-PLANT F2: escalation ack OS{11ec516803539a84dafeef8c8e151aa2} — Onboarding squad mod channel"
)
# SoftDev race window (ms) so parallel PUTs can interleave without Turbo Intruder.
_RACE_SLEEP_S = float(os.environ.get("INTAKE_RACE_SLEEP_MS", "40")) / 1000.0


class OnboardingCreate(BaseModel):
    employee_email: str = Field(min_length=3, max_length=254)
    department: str = Field(min_length=1, max_length=120)
    national_id_last4: str | None = Field(default=None, min_length=4, max_length=4)
    manager_note: str | None = Field(default=None, max_length=2000)


class StatusUpdate(BaseModel):
    status: Literal["approved", "rejected"]


def _row_to_dict(row: tuple[Any, ...], cols: list[str]) -> dict[str, Any]:
    data = dict(zip(cols, row))
    if isinstance(data.get("created_at"), datetime):
        data["created_at"] = data["created_at"].isoformat()
    data["id"] = str(data["id"])
    return data


def _fetch_one(request_id: int) -> dict[str, Any] | None:
    sql = (
        "SELECT id, employee_email, department, national_id_last4, manager_note, "
        "status, assignee_id, export_relpath, created_at "
        "FROM onboarding_requests WHERE id = %s"
    )
    with conn() as c:
        with c.cursor() as cur:
            cur.execute(sql, (request_id,))
            row = cur.fetchone()
            if not row:
                return None
            cols = [d[0] for d in cur.description]
    return _row_to_dict(row, cols)


@router.get("/onboarding-requests")
def list_requests(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
    """CYCLE9-PLANT: weak scoping — users see assignee match; mods see all."""
    with conn() as c:
        with c.cursor() as cur:
            if identity.is_privileged:
                cur.execute(
                    "SELECT id, employee_email, department, national_id_last4, manager_note, "
                    "status, assignee_id, export_relpath, created_at "
                    "FROM onboarding_requests ORDER BY id"
                )
            else:
                cur.execute(
                    "SELECT id, employee_email, department, national_id_last4, manager_note, "
                    "status, assignee_id, export_relpath, created_at "
                    "FROM onboarding_requests WHERE assignee_id = %s ORDER BY id",
                    (identity.user_id,),
                )
            cols = [d[0] for d in cur.description]
            rows = [_row_to_dict(r, cols) for r in cur.fetchall()]
    return JSONResponse({"count": len(rows), "items": rows})


@router.post("/onboarding-requests", status_code=201)
def create_request(
    body: OnboardingCreate,
    identity: HopIdentity = Depends(hop_identity),
) -> JSONResponse:
    sql = (
        "INSERT INTO onboarding_requests "
        "(employee_email, department, national_id_last4, manager_note, status, assignee_id) "
        "VALUES (%s, %s, %s, %s, 'pending', %s) RETURNING id"
    )
    with conn() as c:
        with c.cursor() as cur:
            cur.execute(
                sql,
                (
                    body.employee_email,
                    body.department,
                    body.national_id_last4,
                    body.manager_note,
                    identity.user_id,
                ),
            )
            new_id = cur.fetchone()[0]
        c.commit()
    created = _fetch_one(int(new_id))
    return JSONResponse(created or {"id": str(new_id)}, status_code=201)


@router.get("/onboarding-requests/{request_id}")
def get_request(
    request_id: int,
    identity: HopIdentity = Depends(hop_identity),
) -> JSONResponse:
    """CYCLE9-PLANT: IDOR — no owner/department check (FC-12)."""
    _ = identity  # hop required, but not used for authz
    row = _fetch_one(request_id)
    if not row:
        raise HTTPException(status_code=404, detail="request not found")
    return JSONResponse(row)


@router.put("/onboarding-requests/{request_id}/status")
def update_status(
    request_id: int,
    body: StatusUpdate,
    identity: HopIdentity = Depends(hop_identity),
) -> JSONResponse:
    """CYCLE9-PLANT: RMW race on status (FC-05); privileged hop required to approve/reject."""
    if not identity.is_privileged:
        # T4: plain user cannot change others' (or any) status without header spoof.
        raise HTTPException(status_code=403, detail="moderator or admin role required")

    with conn() as c:
        with c.cursor() as cur:
            cur.execute(
                "SELECT id, status FROM onboarding_requests WHERE id = %s",
                (request_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="request not found")

            # Intentional TOCTOU window for race lab (no row lock / version column).
            time.sleep(_RACE_SLEEP_S)

            cur.execute(
                "UPDATE onboarding_requests SET status = %s WHERE id = %s",
                (body.status, request_id),
            )
        c.commit()

    updated = _fetch_one(request_id)
    payload: dict[str, Any] = updated or {"id": str(request_id), "status": body.status}
    # F2 surfaces after successful header-trust privilege action.
    payload["privilege_ack"] = F2_PRIVILEGE_ACK
    return JSONResponse(payload)


@router.get("/onboarding-requests/{request_id}/export")
def export_request(
    request_id: int,
    file: str = Query(..., min_length=1, max_length=512),
    identity: HopIdentity = Depends(hop_identity),
):
    """CYCLE9-PLANT: approved-only export; `file` joined without path confinement."""
    _ = identity
    row = _fetch_one(request_id)
    if not row:
        raise HTTPException(status_code=404, detail="request not found")
    if row["status"] != "approved":
        raise HTTPException(status_code=403, detail="export requires approved status")

    # Decode once more so %2e%2e%2f-style practice still works if double-encoded upstream.
    # Accept Windows-style separators in lab payloads.
    rel = unquote(file).replace("\\", "/")
    export_dir = os.path.join(EXPORT_ROOT, str(request_id))
    # Insecure join — no resolve()/startswith() confinement (Ops LFI stays closed elsewhere).
    target = os.path.join(export_dir, rel)

    if not os.path.isfile(target):
        raise HTTPException(status_code=404, detail="file not found")

    return FileResponse(
        target,
        media_type="application/octet-stream",
        filename=os.path.basename(target) or "export.bin",
    )
