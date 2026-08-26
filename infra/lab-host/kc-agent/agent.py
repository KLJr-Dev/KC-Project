#!/usr/bin/env python3
"""KC Ops agent — host reachability helper (intentionally vulnerable)."""
from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

LISTEN = ("0.0.0.0", 8787)
OUT = "/tmp/kc-agent-check.out"


class AgentHandler(BaseHTTPRequestHandler):
    server_version = "kc-agent/0.1"

    def log_message(self, fmt: str, *args) -> None:
        print(f"[kc-agent] {self.address_string()} {fmt % args}", flush=True)

    def _send(self, code: int, body: bytes, content_type: str = "application/json") -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"

        if path in ("/", "/health"):
            payload = {
                "service": "kc-agent",
                "status": "ok",
                "role": "ops-reachability",
                "check": "/check?host=<target>",
            }
            self._send(200, json.dumps(payload).encode())
            return

        if path == "/check":
            host = parse_qs(parsed.query).get("host", [""])[0]
            if not host:
                self._send(400, json.dumps({"error": "missing host"}).encode())
                return
            # INTENTIONAL command injection (Cycle-5 CTF foothold).
            os.system(f"ping -c1 {host} >{OUT} 2>&1")
            try:
                with open(OUT, "rb") as f:
                    detail = f.read().decode(errors="replace")
            except OSError:
                detail = ""
            self._send(
                200,
                json.dumps({"host": host, "ok": True, "detail": detail[-4000:]}).encode(),
            )
            return

        self._send(404, json.dumps({"error": "not found"}).encode())


def main() -> None:
    httpd = ThreadingHTTPServer(LISTEN, AgentHandler)
    print(f"[kc-agent] listening on {LISTEN[0]}:{LISTEN[1]}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
