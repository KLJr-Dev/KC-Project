#!/usr/bin/env bash
# Cycle-10 SoftDev B9 — staged examiner
#
# Infra plants + publish gates + Nest packets/RBAC e2e against edge HTTPS tip.
# Authority: v1.10.0-ground-truth.md · backend product SoftDev B9-api
# Usage: ./infra/cycle10-examiner.sh
# Env: EDGE_BASE (default https://localhost — host :443 only)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EDGE_BASE="${EDGE_BASE:-https://localhost}"
fail() { echo "FAIL: $*" >&2; exit 1; }

echo "== Cycle-10 examiner (SoftDev) =="

"${ROOT}/infra/assert-cycle10-unpublished.sh"
"${ROOT}/infra/cycle10-b8-smoke.sh"
"${ROOT}/infra/cycle10-b5-smoke.sh"
"${ROOT}/infra/cycle10-b7-smoke.sh"
"${ROOT}/infra/cycle10-reachability.sh"

# Flag presence (paths locked in ground-truth)
docker exec c10-docproc grep -q 'OS{c10local' /home/docuser/local.txt \
  || fail "local flag missing"
docker exec c10-docproc grep -q 'OS{c10proof' /root/proof.txt \
  || fail "proof flag missing"
docker exec c10-bastion grep -q 'OS{c10crown' /root/crown.txt \
  || fail "crown flag missing"

# Bastion secret matches Welcome1 (Johnable default)
docker exec c10-docproc grep -qx 'Welcome1' /root/bastion.secret \
  || fail "bastion.secret mismatch"

# Sticky-note password must not match bastion hash (root su bypasses auth — use crypt)
docker exec c10-ws-admin grep -q 'Summer2024' /home/helpdesk/sticky-note.txt \
  || fail "helpdesk sticky-note missing"
HASH="$(docker exec c10-bastion getent shadow nwadmin | cut -d: -f2)"
SALT="$(printf '%s' "$HASH" | cut -d'$' -f3)"
CALC="$(openssl passwd -6 -salt "$SALT" 'Summer2024')"
[[ "$CALC" != "$HASH" ]] || fail "bastion hash is Summer2024 (sticky-note must be wrong)"
CALC_OK="$(openssl passwd -6 -salt "$SALT" 'Welcome1')"
[[ "$CALC_OK" == "$HASH" ]] || fail "bastion hash is not Welcome1"

echo "OK: B9 examiner — infra plants + flags + sticky-note rejection"

# ---------------------------------------------------------------------------
# B9-api — Nest packets hard gates (edge HTTPS tip)
# A noise user 403 · B Stage-0 moderator · C mod upload 201 · D helper fingerprint
# ---------------------------------------------------------------------------
echo "== B9-api packets / RBAC =="

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
PASS='ExamPassw0rd!'
SUF="$(date +%s)-$$"
NOISE_EMAIL="noise${SUF}@kc.test"
NOISE_USER="noise${SUF}"
MOD_EMAIL="mod${SUF}@kc.test"
MOD_USER="mod${SUF}"
printf 'readme for examiner\n' >"${TMP}/readme.txt"

# A — open register (noise user) → packets 403
curl -sk -o "${TMP}/reg.json" -w '%{http_code}' \
  "${EDGE_BASE}/api/auth/register" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${NOISE_EMAIL}\",\"password\":\"${PASS}\",\"username\":\"${NOISE_USER}\"}" \
  >"${TMP}/reg.code"
[[ "$(cat "${TMP}/reg.code")" == "201" ]] || fail "A register expected 201 got $(cat "${TMP}/reg.code") body=$(cat "${TMP}/reg.json")"
NOISE_TOK="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["token"])' "${TMP}/reg.json")"
[[ -n "${NOISE_TOK}" ]] || fail "A register missing token"
curl -sk -o "${TMP}/u403.json" -w '%{http_code}' \
  "${EDGE_BASE}/api/packets" \
  -H "Authorization: Bearer ${NOISE_TOK}" \
  -F "file=@${TMP}/readme.txt;filename=readme.txt" \
  >"${TMP}/u403.code"
[[ "$(cat "${TMP}/u403.code")" == "403" ]] || fail "A plain user packets expected 403 got $(cat "${TMP}/u403.code") body=$(cat "${TMP}/u403.json")"
echo "OK: A — noise user packets 403"

# B — Stage-0 access-request grants moderator (never admin)
curl -sk -o "${TMP}/ar.json" -w '%{http_code}' \
  "${EDGE_BASE}/api/access-requests" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MOD_EMAIL}\",\"password\":\"${PASS}\",\"username\":\"${MOD_USER}\",\"reason\":\"examiner staff access\"}" \
  >"${TMP}/ar.code"
AR_CODE="$(cat "${TMP}/ar.code")"
[[ "${AR_CODE}" == "201" || "${AR_CODE}" == "200" ]] || fail "B access-request expected 200/201 got ${AR_CODE} body=$(cat "${TMP}/ar.json")"
python3 - "${TMP}/ar.json" <<'PY' || fail "B access-request role not moderator"
import json, sys
body = json.load(open(sys.argv[1]))
role = body.get("role")
if role != "moderator":
    raise SystemExit(f"role={role!r}")
if role == "admin":
    raise SystemExit("admin grant forbidden")
print("OK: B — Stage-0 role=moderator")
PY

# C — moderator login + packet upload 201
curl -sk -o "${TMP}/modlogin.json" -w '%{http_code}' \
  "${EDGE_BASE}/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${MOD_EMAIL}\",\"password\":\"${PASS}\"}" \
  >"${TMP}/modlogin.code"
[[ "$(cat "${TMP}/modlogin.code")" == "201" ]] || fail "C mod login expected 201 got $(cat "${TMP}/modlogin.code") body=$(cat "${TMP}/modlogin.json")"
MOD_TOK="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["token"])' "${TMP}/modlogin.json")"
curl -sk -o "${TMP}/up.json" -w '%{http_code}' \
  "${EDGE_BASE}/api/packets" \
  -H "Authorization: Bearer ${MOD_TOK}" \
  -F "file=@${TMP}/readme.txt;filename=readme.txt" \
  >"${TMP}/up.code"
[[ "$(cat "${TMP}/up.code")" == "201" ]] || fail "C mod upload expected 201 got $(cat "${TMP}/up.code") body=$(cat "${TMP}/up.json")"
python3 - "${TMP}/up.json" <<'PY' || fail "C upload body missing id/helperOutput"
import json, sys
body = json.load(open(sys.argv[1]))
if not body.get("id"):
    raise SystemExit("missing id")
if "helperOutput" not in body:
    raise SystemExit("missing helperOutput")
print("OK: C — moderator upload 201")
PY

# D — helper fingerprint (plant path live); fall back to /health from api net
python3 - "${TMP}/up.json" <<'PY'
import json, sys
body = json.load(open(sys.argv[1]))
out = (body.get("helperOutput") or "").strip()
if out and not out.startswith("helper-error:"):
    print("OK: D — helperOutput fingerprint (plant path)")
    sys.exit(0)
sys.exit(2)
PY
D_RC=$?
if [[ "$D_RC" -eq 0 ]]; then
  :
elif [[ "$D_RC" -eq 2 ]]; then
  HEALTH="$(docker exec infra-backend-1 node -e 'fetch(process.env.DOCPROC_URL+"/health").then(r=>r.text()).then(t=>{console.log(t);process.exit(t.includes("docproc-helper/1.10.0")?0:1)}).catch(e=>{console.error(e);process.exit(1)})' 2>/dev/null || true)"
  echo "${HEALTH}" | grep -q 'docproc-helper/1.10.0' \
    || fail "D helper fingerprint failed (upload helper-error + health miss) body=$(cat "${TMP}/up.json")"
  echo "OK: D — docproc /health fingerprint fallback (api→docproc)"
else
  fail "D helperOutput parse failed"
fi

echo "OK: B9 examiner — infra + packets API stages A–D"
