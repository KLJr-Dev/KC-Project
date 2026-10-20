"""Onboarding / HR requests — hardened for v2.6.0 (Cycle-9 Blue)."""

from __future__ import annotations

import os
from datetime import datetime
from pathlib import Path
from typing import Any, Literal
from urllib.parse import unquote

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from .db import conn
from .identity import HopIdentity, assert_can_access_request, hop_identity

router = APIRouter(tags=["onboarding-requests"])

EXPORT_ROOT = os.environ.get("EXPORT_ROOT", "/app/exports")


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


def _safe_export_path(request_id: int, file: str) -> Path:
    """Resolve `file` under EXPORT_ROOT/{id}/ — reject traversal."""
    rel = unquote(file).replace("\\", "/").lstrip("/")
    export_dir = Path(EXPORT_ROOT).joinpath(str(request_id)).resolve()
    target = (export_dir / rel).resolve()
    try:
        target.relative_to(export_dir)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="invalid file path") from exc
    return target


@router.get("/onboarding-requests")
def list_requests(identity: HopIdentity = Depends(hop_identity)) -> JSONResponse:
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
    row = _fetch_one(request_id)
    if not row:
        raise HTTPException(status_code=404, detail="request not found")
    assert_can_access_request(identity, row.get("assignee_id"))
    return JSONResponse(row)


@router.put("/onboarding-requests/{request_id}/status")
def update_status(
    request_id: int,
    body: StatusUpdate,
    identity: HopIdentity = Depends(hop_identity),
) -> JSONResponse:
    if not identity.is_privileged:
        raise HTTPException(status_code=403, detail="moderator or admin role required")

    with conn() as c:
        with c.cursor() as cur:
            cur.execute(
                "SELECT id, status FROM onboarding_requests WHERE id = %s FOR UPDATE",
                (request_id,),
            )
            row = cur.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="request not found")

            cur.execute(
                "UPDATE onboarding_requests SET status = %s WHERE id = %s",
                (body.status, request_id),
            )
        c.commit()

    updated = _fetch_one(request_id)
    payload: dict[str, Any] = updated or {"id": str(request_id), "status": body.status}
    return JSONResponse(payload)


@router.get("/onboarding-requests/{request_id}/export")
def export_request(
    request_id: int,
    file: str = Query(..., min_length=1, max_length=512),
    identity: HopIdentity = Depends(hop_identity),
):
    row = _fetch_one(request_id)
    if not row:
        raise HTTPException(status_code=404, detail="request not found")
    assert_can_access_request(identity, row.get("assignee_id"))
    if row["status"] != "approved":
        raise HTTPException(status_code=403, detail="export requires approved status")

    target = _safe_export_path(request_id, file)
    if not target.is_file():
        raise HTTPException(status_code=404, detail="file not found")

    return FileResponse(
        target,
        media_type="application/octet-stream",
        filename=target.name or "export.bin",
    )
