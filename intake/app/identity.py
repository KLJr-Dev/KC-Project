"""CYCLE9-PLANT: trust Nest hop headers for identity / authz (insecure tip)."""

from __future__ import annotations

from dataclasses import dataclass

from fastapi import Header, HTTPException


@dataclass(frozen=True)
class HopIdentity:
    user_id: str
    role: str

    @property
    def is_privileged(self) -> bool:
        return self.role in ("moderator", "admin")


def hop_identity(
    x_user_id: str | None = Header(default=None, alias="X-User-Id"),
    x_user_role: str | None = Header(default=None, alias="X-User-Role"),
) -> HopIdentity:
    # CYCLE9-PLANT: Intake trusts X-User-* from Nest BFF (no JWT verify on SoftDev tip).
    uid = (x_user_id or "").strip()
    role = (x_user_role or "").strip().lower() or "user"
    if not uid:
        raise HTTPException(status_code=401, detail="missing X-User-Id")
    if role not in ("user", "moderator", "admin"):
        role = "user"
    return HopIdentity(user_id=uid, role=role)
