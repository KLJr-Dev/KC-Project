"""Intake identity — verify Platform RS256 JWT; ignore client hop headers."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import jwt
from fastapi import Header, HTTPException


@dataclass(frozen=True)
class HopIdentity:
    user_id: str
    role: str

    @property
    def is_privileged(self) -> bool:
        return self.role in ("moderator", "admin")


@lru_cache(maxsize=1)
def _public_key_pem() -> str:
    path = os.environ.get("JWT_PUBLIC_KEY_PATH", "/run/secrets/jwt-public.pem")
    try:
        return Path(path).read_text(encoding="utf-8")
    except OSError as exc:
        raise RuntimeError(f"JWT public key unreadable at {path}: {exc}") from exc


def hop_identity(
    authorization: str | None = Header(default=None),
) -> HopIdentity:
    """
    Blue (v2.6.0): AuthN/AuthZ from verified Bearer RS256 only.
    Client `X-User-*` headers are intentionally unused (spoof-proof).
    """
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="missing bearer token")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="missing bearer token")

    try:
        payload = jwt.decode(
            token,
            _public_key_pem(),
            algorithms=["RS256"],
            options={"require": ["sub", "exp"]},
        )
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="invalid token") from None

    uid = str(payload.get("sub") or "").strip()
    if not uid:
        raise HTTPException(status_code=401, detail="invalid token subject")

    role = str(payload.get("role") or "user").strip().lower()
    if role not in ("user", "moderator", "admin"):
        role = "user"
    return HopIdentity(user_id=uid, role=role)


def assert_can_access_request(identity: HopIdentity, assignee_id: str | None) -> None:
    """Object-level check: assignee or privileged staff."""
    if identity.is_privileged:
        return
    if assignee_id and str(assignee_id) == identity.user_id:
        return
    raise HTTPException(status_code=403, detail="forbidden")
