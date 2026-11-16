#!/usr/bin/env python3
"""Northwind document helper — classify uploaded packet filenames.

Listen: 0.0.0.0:9090 (DOCPROC_HELPER_PORT). Inbox: /opt/docproc/inbox.

Security (v2.10.0): filename allowlist + subprocess argv list (shell=False).
Never interpolate untrusted input into a shell command (A03).
"""
from __future__ import annotations

import os
import re
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, unquote, urlparse

INBOX = "/opt/docproc/inbox"
PORT = int(os.environ.get("DOCPROC_HELPER_PORT", "9090"))
SAFE_NAME = re.compile(r"^[A-Za-z0-9._-]{1,128}$")


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: str) -> None:
        data = body.encode()
        self.send_response(code)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self) -> None:
        if self.path.startswith("/health"):
            self._send(200, "docproc-helper/2.10.0\n")
            return
        self._send(404, "not found\n")

    def do_POST(self) -> None:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length)
        qs = parse_qs(urlparse(self.path).query)
        name = (qs.get("name") or [None])[0]
        if name:
            name = unquote(name)
        if not name:
            self._send(400, "missing name\n")
            return
        if not SAFE_NAME.match(name):
            self._send(400, "invalid name\n")
            return

        os.makedirs(INBOX, exist_ok=True)
        dest = os.path.join(INBOX, name)
        if raw:
            with open(dest, "wb") as f:
                f.write(raw)

        try:
            out = subprocess.check_output(
                ["file", "--", name],
                shell=False,
                cwd=INBOX,
                stderr=subprocess.STDOUT,
                timeout=5,
            )
            self._send(200, out.decode(errors="replace"))
        except subprocess.CalledProcessError as e:
            self._send(500, e.output.decode(errors="replace"))
        except Exception as e:  # noqa: BLE001
            self._send(500, f"{e}\n")

    def log_message(self, fmt: str, *args) -> None:
        print(f"[helper] {args[0]}")


def main() -> None:
    os.makedirs(INBOX, exist_ok=True)
    httpd = HTTPServer(("0.0.0.0", PORT), Handler)
    print(f"[helper] listening on {PORT}", flush=True)
    httpd.serve_forever()


if __name__ == "__main__":
    main()
