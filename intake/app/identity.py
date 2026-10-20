"""Intake identity — verify Platform RS256 JWT; privilege from Nest-planted hop role."""

from __future__ import annotations

import logging
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import jwt
from fastapi import Header, HTTPException

logger = logging.getLogger("intake.identity")


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


def _normalize_role(raw: str | None) -> str:
    role = (raw or "user").strip().lower()
    if role not in ("user", "moderator", "admin"):
        return "user"
    return role


def hop_identity(
    authorization: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
    x_request_id: str | None = Header(default=None, alias="X-Request-Id"),
) -> HopIdentity:
    """
    Blue (v2.6.0):
    - AuthN: verify Bearer RS256 (sub).
    - AuthZ role: Nest-planted X-User-Role only when X-User-Id == JWT sub.
      JWT role claim alone never elevates.
    """
    if x_request_id:
        logger.info("intake request_id=%s", x_request_id)

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

    hop_uid = (x_user_id or "").strip()
    if hop_uid and hop_uid == uid:
        role = _normalize_role(x_user_role)
    else:
        role = "user"

    return HopIdentity(user_id=uid, role=role)


def assert_can_access_request(identity: HopIdentity, assignee_id: str | None) -> None:
    """Object-level check: assignee or privileged staff."""
    if identity.is_privileged:
        return
    if assignee_id and str(assignee_id) == identity.user_id:
        return
    raise HTTPException(status_code=403, detail="forbidden")
